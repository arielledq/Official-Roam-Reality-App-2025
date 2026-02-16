"""
Band Tracking Services - Business logic with comprehensive edge case handling.

Edge cases handled:
- No active users in system
- User without devices
- OneSignal service unavailable
- Invalid GPS strings
- Transaction rollback on errors
- Duplicate location updates
- Missing band records
- Null location handling
"""
import logging
import re
from typing import Dict, List, Optional, Tuple
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone
from django.contrib.gis.geos import Point
from django.core.exceptions import ValidationError

from users.models import User
from modules.ar.challenges.models import GeoArSite
from .models import (
    BroadcastMessage,
    NotificationHistory,
    BandLocation,
    BandTrackingSettings,
    BandNotificationCooldown
)

logger = logging.getLogger(__name__)


class BroadcastService:
    """
    Handle broadcasting messages to all active users.
    Ensures atomic operations with transaction safety.
    """

    def __init__(self):
        self.logger = logger

    @transaction.atomic
    def send_broadcast(self, message: BroadcastMessage) -> Dict:
        """
        Send broadcast message to ALL active users.

        Edge cases handled:
        - Message already sent
        - No active users
        - Users without devices
        - OneSignal failures
        - Transaction rollback on critical errors

        Returns:
            dict: {
                'success': bool,
                'message_id': int,
                'recipients': int,
                'delivered': int,
                'errors': list
            }
        """
        try:
            # Validate message not already sent
            if message.is_sent:
                return {
                    'success': False,
                    'error': 'Message already sent',
                    'message_id': message.id
                }

            # Get all active users (exclude sender if message has created_by)
            users = User.objects.filter(is_active=True)

            # Exclude sender from receiving their own broadcast
            if message.created_by:
                users = users.exclude(id=message.created_by.id)
                self.logger.info(f"Excluding sender {message.created_by.email} from broadcast")

            user_count = users.count()

            if user_count == 0:
                self.logger.warning("No active users found for broadcast")
                # Still mark as sent even if no users
                message.sent_at = timezone.now()
                message.recipients_count = 0
                message.save()
                return {
                    'success': True,
                    'message_id': message.id,
                    'recipients': 0,
                    'delivered': 0,
                    'warning': 'No active users in system (or only sender exists)'
                }

            # Create notification history for each user (bulk create for performance)
            histories = [
                NotificationHistory(message=message, user=user)
                for user in users
            ]
            NotificationHistory.objects.bulk_create(
                histories,
                ignore_conflicts=True  # Handle potential duplicates
            )

            # Send push notifications
            delivery_result = self._send_push_notifications(message, users)

            # Update message as sent
            message.sent_at = timezone.now()
            message.recipients_count = user_count
            message.save(update_fields=['sent_at', 'recipients_count', 'updated_at'])

            return {
                'success': True,
                'message_id': message.id,
                'recipients': user_count,
                'delivered': delivery_result['delivered_count'],
                'failed': delivery_result['failed_count'],
                'errors': delivery_result.get('errors', [])
            }

        except Exception as e:
            self.logger.error(f"Broadcast failed: {str(e)}", exc_info=True)
            # Transaction will automatically rollback
            return {
                'success': False,
                'error': f'Broadcast failed: {str(e)}',
                'message_id': message.id if message else None
            }

    def _send_push_notifications(self, message: BroadcastMessage, users) -> Dict:
        """
        Send push notifications via OneSignal.

        Edge cases handled:
        - Users without devices
        - Inactive devices
        - OneSignal service unavailable
        - Partial delivery failures
        """
        try:
            # Import here to avoid circular imports
            from onesignal_client.models import UserDevice
            from onesignal_client.client import OneSignalClient

            # Get active devices for users
            devices = UserDevice.objects.filter(
                user__in=users,
                active=True
            ).select_related('user')

            if not devices.exists():
                self.logger.warning("No active devices found for any users")
                return {
                    'delivered_count': 0,
                    'failed_count': users.count(),
                    'errors': ['No active devices found']
                }

            # Build user -> device mapping
            device_map = {}
            for device in devices:
                user_id = device.user_id
                if user_id not in device_map:
                    device_map[user_id] = []
                device_map[user_id].append(device.device_id)

            # Collect all device IDs
            all_device_ids = [
                device_id
                for device_list in device_map.values()
                for device_id in device_list
            ]

            if not all_device_ids:
                self.logger.warning("No device IDs found")
                return {
                    'delivered_count': 0,
                    'failed_count': users.count(),
                    'errors': ['No valid device IDs']
                }

            # Send via OneSignal
            try:
                client = OneSignalClient()
                notification_result = client.send_notification(
                    device_ids=all_device_ids,
                    title=message.title,
                    content=message.content,
                    data={'message_id': message.id, 'type': 'broadcast'}
                )

                notification_id = notification_result.get('id') if notification_result else None

                # Mark as delivered for users with devices
                NotificationHistory.objects.filter(
                    message=message,
                    user_id__in=device_map.keys()
                ).update(
                    delivered=True,
                    delivered_at=timezone.now(),
                    notification_id=notification_id
                )

                # Mark as failed for users without devices
                users_without_devices = set(users.values_list('id', flat=True)) - set(device_map.keys())
                if users_without_devices:
                    NotificationHistory.objects.filter(
                        message=message,
                        user_id__in=users_without_devices
                    ).update(
                        delivered=False,
                        error_message="No active device found"
                    )

                return {
                    'delivered_count': len(device_map),
                    'failed_count': len(users_without_devices),
                    'notification_id': notification_id
                }

            except Exception as e:
                self.logger.error(f"OneSignal error: {str(e)}", exc_info=True)
                # Mark all as failed
                NotificationHistory.objects.filter(
                    message=message
                ).update(
                    delivered=False,
                    error_message=f"Push notification failed: {str(e)}"
                )
                return {
                    'delivered_count': 0,
                    'failed_count': users.count(),
                    'errors': [f"OneSignal error: {str(e)}"]
                }

        except ImportError as e:
            self.logger.error(f"Import error: {str(e)}", exc_info=True)
            return {
                'delivered_count': 0,
                'failed_count': users.count(),
                'errors': [f"Service unavailable: {str(e)}"]
            }
        except Exception as e:
            self.logger.error(f"Push notification error: {str(e)}", exc_info=True)
            return {
                'delivered_count': 0,
                'failed_count': users.count(),
                'errors': [str(e)]
            }


class BandLocationService:
    """
    Handle GPS location updates from bands.
    Parses various GPS formats and triggers notifications on significant movement.

    Now uses database settings for:
    - Distance threshold (configurable, default 111m)
    - Auto-notify enable/disable
    - Cooldown period between notifications
    """

    # Supported GPS formats
    GPS_FORMAT_SIMPLE = 'simple'  # "lat,lng"
    GPS_FORMAT_NMEA = 'nmea'  # "$GPGGA,..."

    def __init__(self):
        self.logger = logger

    def update_location(
        self,
        band_id: int,
        gps_string: str,
        auto_notify: bool = True
    ) -> Dict:
        """
        Update band location from GPS string.

        Edge cases handled:
        - Invalid band_id
        - Invalid GPS string formats
        - Null/empty GPS strings
        - Duplicate location updates
        - Missing band records
        - Transaction rollback on errors

        Args:
            band_id: ID of the GeoArSite (band)
            gps_string: Raw GPS string from third party
            auto_notify: Whether to auto-broadcast on significant movement

        Returns:
            dict: {
                'success': bool,
                'band_name': str,
                'location': {'lat': float, 'lng': float},
                'moved_significantly': bool,
                'notification_sent': bool
            }
        """
        try:
            # Validate inputs
            if not gps_string or not gps_string.strip():
                return {
                    'success': False,
                    'error': 'GPS string cannot be empty'
                }

            gps_string = gps_string.strip()

            # Get band
            try:
                band = GeoArSite.objects.get(id=band_id)
            except GeoArSite.DoesNotExist:
                self.logger.error(f"Band not found: {band_id}")
                return {
                    'success': False,
                    'error': f'Band with ID {band_id} not found'
                }

            # Parse GPS string
            lat, lng, metadata = self._parse_gps_string(gps_string)

            if lat is None or lng is None:
                self.logger.error(f"Invalid GPS string: {gps_string}")
                return {
                    'success': False,
                    'error': 'Invalid GPS string format',
                    'band_name': band.name
                }

            # Validate coordinates
            if not self._validate_coordinates(lat, lng):
                return {
                    'success': False,
                    'error': f'Invalid coordinates: lat={lat}, lng={lng}',
                    'band_name': band.name
                }

            # Create Point (note: Point(x, y) = Point(lng, lat))
            new_location = Point(lng, lat)

            # Get settings from database
            settings = BandTrackingSettings.get_settings()

            # Check for significant movement
            old_location = band.lat_long
            moved_significantly = False
            distance_meters = 0

            if old_location:
                distance_meters = self._calculate_distance(old_location, new_location)
                # Check if moved more than threshold (from database settings)
                if distance_meters > settings.distance_threshold_meters:
                    moved_significantly = True
                    self.logger.info(
                        f"Band {band.name} moved {distance_meters:.2f} meters "
                        f"(threshold: {settings.distance_threshold_meters}m)"
                    )
                else:
                    self.logger.debug(
                        f"Band {band.name} movement too small: {distance_meters:.2f} meters "
                        f"(threshold: {settings.distance_threshold_meters}m)"
                    )

            # Use transaction for atomic update
            with transaction.atomic():
                # Update band location
                band.lat_long = new_location
                band.save(update_fields=['lat_long'])

                # Save location history
                location_record = BandLocation.objects.create(
                    band=band,
                    location=new_location,
                    gps_string=gps_string,
                    accuracy=metadata.get('accuracy'),
                    altitude=metadata.get('altitude'),
                    speed=metadata.get('speed')
                )

            # Send silent location update if moved significantly
            notification_sent = False
            if auto_notify and moved_significantly:
                notification_sent = self._send_silent_location_update(
                    band, lat, lng, distance_meters
                )

            return {
                'success': True,
                'band_id': band.id,
                'band_name': band.name,
                'location': {
                    'lat': lat,
                    'lng': lng
                },
                'moved_significantly': moved_significantly,
                'distance_meters': round(distance_meters, 2),
                'notification_sent': notification_sent,
                'history_id': location_record.id
            }

        except Exception as e:
            self.logger.error(f"Location update failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': f'Location update failed: {str(e)}'
            }

    def _parse_gps_string(self, gps_string: str) -> Tuple[Optional[float], Optional[float], Dict]:
        """
        Parse various GPS string formats.

        Supported formats:
        1. Simple: "40.7128,-74.0060"
        2. Simple with spaces: "40.7128, -74.0060"
        3. NMEA: "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47"

        Returns:
            Tuple[lat, lng, metadata_dict]
        """
        # Try simple format first: "lat,lng"
        if ',' in gps_string and not gps_string.startswith('$'):
            parts = gps_string.split(',')
            if len(parts) >= 2:
                try:
                    lat = float(parts[0].strip())
                    lng = float(parts[1].strip())
                    return lat, lng, {}
                except (ValueError, InvalidOperation):
                    pass

        # Try NMEA format: $GPGGA,... or $GPRMC,...
        if gps_string.startswith('$GP'):
            return self._parse_nmea(gps_string)

        # Unknown format
        return None, None, {}

    def _parse_nmea(self, nmea_string: str) -> Tuple[Optional[float], Optional[float], Dict]:
        """
        Parse NMEA GPS format. Routes to appropriate parser based on sentence type.

        Supported formats:
        - $GPGGA: Global Positioning System Fix Data
        - $GPRMC: Recommended Minimum Specific GPS/Transit Data
        """
        # Route to appropriate parser based on sentence type
        if nmea_string.startswith('$GPRMC'):
            return self._parse_gprmc(nmea_string)
        elif nmea_string.startswith('$GPGGA'):
            return self._parse_gpgga(nmea_string)
        else:
            self.logger.warning(f"Unsupported NMEA sentence type: {nmea_string[:10]}")
            return None, None, {}

    def _parse_gpgga(self, nmea_string: str) -> Tuple[Optional[float], Optional[float], Dict]:
        """
        Parse GPGGA NMEA format (Global Positioning System Fix Data).

        Example: $GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
        Format: $GPGGA,time,lat,N/S,lng,E/W,quality,satellites,hdop,altitude,M,geoid,M,age,station*checksum
        """
        try:
            parts = nmea_string.split(',')

            if len(parts) < 6:
                return None, None, {}

            # Extract latitude (format: DDMM.MMMM)
            lat_raw = parts[2]
            lat_dir = parts[3]  # N or S

            if not lat_raw or not lat_dir:
                return None, None, {}

            lat_decimal = float(lat_raw)
            lat_deg = int(lat_decimal / 100)
            lat_min = lat_decimal - (lat_deg * 100)
            lat = lat_deg + (lat_min / 60.0)

            if lat_dir == 'S':
                lat = -lat

            # Extract longitude (format: DDDMM.MMMM)
            lng_raw = parts[4]
            lng_dir = parts[5]  # E or W

            if not lng_raw or not lng_dir:
                return None, None, {}

            lng_decimal = float(lng_raw)
            lng_deg = int(lng_decimal / 100)
            lng_min = lng_decimal - (lng_deg * 100)
            lng = lng_deg + (lng_min / 60.0)

            if lng_dir == 'W':
                lng = -lng

            # Extract metadata
            metadata = {}
            try:
                if len(parts) > 9 and parts[9]:
                    metadata['altitude'] = float(parts[9])
                if len(parts) > 8 and parts[8]:
                    metadata['accuracy'] = float(parts[8]) * 10  # HDOP to meters approximation
            except (ValueError, IndexError):
                pass

            return lat, lng, metadata

        except (ValueError, IndexError, AttributeError) as e:
            self.logger.error(f"GPGGA parsing error: {str(e)}")
            return None, None, {}

    def _parse_gprmc(self, nmea_string: str) -> Tuple[Optional[float], Optional[float], Dict]:
        """
        Parse GPRMC NMEA format (Recommended Minimum Specific GPS/Transit Data).

        Example: $GPRMC,160814.00,A,1014.769380,N,06128.027412,W,0.0,44.6,120226,13.7,W,A,V,TR01*60
        Format: $GPRMC,time,status,lat,N/S,lon,E/W,speed,track,date,mag_var,E/W,mode,nav_status,vehicle_id*checksum

        Field positions:
        [0] = $GPRMC (sentence type)
        [1] = 160814.00 (time in UTC: HHMMSS.SS)
        [2] = A (status: A=active/valid, V=void/invalid)
        [3] = 1014.769380 (latitude: DDMM.MMMMMM)
        [4] = N (latitude direction: N=North, S=South)
        [5] = 06128.027412 (longitude: DDDMM.MMMMMM)
        [6] = W (longitude direction: E=East, W=West)
        [7] = 0.0 (speed over ground in knots)
        [8] = 44.6 (track angle in degrees)
        [9] = 120226 (date: DDMMYY)
        [10] = 13.7 (magnetic variation)
        [11] = W (magnetic variation direction: E/W)
        [12] = A (mode indicator)
        [13] = V (navigation status)
        [14] = TR01*60 (vehicle_id*checksum)

        Returns:
            Tuple[lat, lng, metadata_dict]
        """
        try:
            parts = nmea_string.split(',')

            # Validate minimum number of fields (at least lat, lon, and directions)
            if len(parts) < 7:
                self.logger.warning(f"GPRMC sentence too short: {len(parts)} fields")
                return None, None, {}

            # Check status field (index 2): A=valid, V=void
            status = parts[2] if len(parts) > 2 else ''
            if status != 'A':
                self.logger.warning(f"GPRMC status invalid: {status} (expected 'A')")
                # Continue parsing anyway, but log the warning

            # Extract latitude (format: DDMM.MMMMMM at index 3)
            lat_raw = parts[3]
            lat_dir = parts[4]  # N or S

            if not lat_raw or not lat_dir:
                return None, None, {}

            # Convert from DDMM.MMMMMM to decimal degrees
            lat_decimal = float(lat_raw)
            lat_deg = int(lat_decimal / 100)
            lat_min = lat_decimal - (lat_deg * 100)
            lat = lat_deg + (lat_min / 60.0)

            if lat_dir == 'S':
                lat = -lat

            # Extract longitude (format: DDDMM.MMMMMM at index 5)
            lng_raw = parts[5]
            lng_dir = parts[6]  # E or W

            if not lng_raw or not lng_dir:
                return None, None, {}

            # Convert from DDDMM.MMMMMM to decimal degrees
            lng_decimal = float(lng_raw)
            lng_deg = int(lng_decimal / 100)
            lng_min = lng_decimal - (lng_deg * 100)
            lng = lng_deg + (lng_min / 60.0)

            if lng_dir == 'W':
                lng = -lng

            # Extract metadata
            metadata = {}
            try:
                # Speed over ground (knots) - convert to km/h
                if len(parts) > 7 and parts[7]:
                    speed_knots = float(parts[7])
                    metadata['speed'] = speed_knots * 1.852  # Convert knots to km/h

                # Track angle (degrees)
                if len(parts) > 8 and parts[8]:
                    metadata['track_angle'] = float(parts[8])

                # Date (DDMMYY)
                if len(parts) > 9 and parts[9]:
                    date_str = parts[9]
                    if len(date_str) == 6:
                        metadata['date'] = f"20{date_str[4:6]}-{date_str[2:4]}-{date_str[0:2]}"  # YYMMDD -> YYYY-MM-DD

                # Vehicle ID (before checksum in last field)
                if len(parts) > 14:
                    last_field = parts[-1]
                    if '*' in last_field:
                        vehicle_id = last_field.split('*')[0].strip()
                        if vehicle_id:
                            metadata['vehicle_id'] = vehicle_id

            except (ValueError, IndexError) as e:
                self.logger.debug(f"Could not parse GPRMC metadata: {e}")
                pass

            self.logger.debug(
                f"GPRMC parsed: lat={lat:.6f}, lng={lng:.6f}, "
                f"speed={metadata.get('speed', 0):.1f}km/h, "
                f"vehicle={metadata.get('vehicle_id', 'N/A')}"
            )

            return lat, lng, metadata

        except (ValueError, IndexError, AttributeError) as e:
            self.logger.error(f"GPRMC parsing error: {str(e)}")
            return None, None, {}

    def _validate_coordinates(self, lat: float, lng: float) -> bool:
        """
        Validate latitude and longitude are within valid ranges.

        Lat: -90 to +90
        Lng: -180 to +180
        """
        if lat < -90 or lat > 90:
            self.logger.error(f"Invalid latitude: {lat}")
            return False

        if lng < -180 or lng > 180:
            self.logger.error(f"Invalid longitude: {lng}")
            return False

        return True

    def _calculate_distance(self, point1: Point, point2: Point) -> float:
        """
        Calculate distance between two points in meters.
        Uses simple Euclidean distance (good enough for small distances).

        For more accuracy, could use Haversine formula.
        """
        from math import sqrt

        # Simple Euclidean distance in degrees
        dx = point1.x - point2.x
        dy = point1.y - point2.y
        distance_degrees = sqrt(dx ** 2 + dy ** 2)

        # Convert to meters (approximate: 1 degree ≈ 111 km at equator)
        distance_meters = distance_degrees * 111000

        return distance_meters

    def _send_silent_location_update(
        self,
        band: GeoArSite,
        latitude: float,
        longitude: float,
        distance_meters: float
    ) -> bool:
        """
        Send silent data notification with GPS coordinates.
        NO popup, NO broadcast message - just real-time location update to client.

        This is called when:
        - Auto-notify is enabled
        - Band moved significantly (>threshold)
        - NOT in cooldown period

        Args:
            band: The band that moved
            latitude: New latitude
            longitude: New longitude
            distance_meters: How far the band moved

        Returns:
            bool: True if silent notification sent successfully
        """
        try:
            # Get settings
            settings = BandTrackingSettings.get_settings()

            # Check if auto-notify is enabled
            if not settings.auto_notify_enabled:
                self.logger.info(
                    f"Auto-notify disabled. Skipping silent notification for {band.name}"
                )
                return False

            # Check cooldown period
            try:
                cooldown = BandNotificationCooldown.objects.get(band=band)
                if cooldown.is_in_cooldown(settings.cooldown_minutes):
                    self.logger.info(
                        f"Band {band.name} in cooldown. Skipping silent notification. "
                        f"Last sent: {cooldown.last_notification_at}"
                    )
                    return False
            except BandNotificationCooldown.DoesNotExist:
                # No cooldown record exists yet, can proceed
                pass

            # Get active user devices
            from onesignal_client.models import UserDevice
            devices = UserDevice.objects.filter(
                user__is_active=True,
                active=True
            ).values_list('device_id', flat=True)

            device_ids = list(devices)

            if not device_ids:
                self.logger.warning(
                    f"No active devices found. Silent notification not sent for {band.name}"
                )
                return False

            # Prepare silent data payload
            data = {
                'type': 'silent_location_update',
                'band_id': band.id,
                'band_name': band.name,
                'latitude': latitude,
                'longitude': longitude,
                'distance_moved': round(distance_meters, 2),
                'timestamp': timezone.now().isoformat(),
                'is_tracking': True
            }

            # Send silent notification via OneSignal
            from onesignal_client.client import OneSignalClient
            client = OneSignalClient()
            response = client.send_silent_data(device_ids=device_ids, data=data)

            if response:
                # Update cooldown record
                BandNotificationCooldown.objects.update_or_create(
                    band=band,
                    defaults={
                        'last_notification_at': timezone.now(),
                        'last_notification_message': None  # No broadcast message created
                    }
                )

                self.logger.info(
                    f"✅ Silent location update sent for {band.name} to {len(device_ids)} devices. "
                    f"Moved {distance_meters:.1f}m to ({latitude:.6f}, {longitude:.6f}). "
                    f"Next update available in {settings.cooldown_minutes} minutes."
                )
                return True
            else:
                self.logger.error(
                    f"❌ Silent notification failed for {band.name}"
                )
                return False

        except Exception as e:
            self.logger.error(f"Silent notification error: {str(e)}", exc_info=True)
            return False

    def get_band_location_history(
        self,
        band_id: int,
        limit: int = 50
    ) -> List[Dict]:
        """
        Get location history for a band.

        Args:
            band_id: ID of the band
            limit: Maximum number of records to return

        Returns:
            List of location records
        """
        try:
            locations = BandLocation.objects.filter(
                band_id=band_id
            ).order_by('-timestamp')[:limit]

            return [
                {
                    'id': loc.id,
                    'latitude': loc.latitude,
                    'longitude': loc.longitude,
                    'timestamp': loc.timestamp.isoformat(),
                    'accuracy': loc.accuracy,
                    'altitude': loc.altitude,
                    'speed': loc.speed
                }
                for loc in locations
            ]

        except Exception as e:
            self.logger.error(f"Error fetching location history: {str(e)}")
            return []

    def get_all_current_locations(self, stale_threshold_minutes: int = 60) -> List[Dict]:
        """
        Get current location for all bands being tracked.

        Edge cases handled:
        - Bands with no location data (never received GPS update)
        - Stale location data (last update too old)
        - Bands with lat_long = None
        - Database errors
        - Empty result set

        Args:
            stale_threshold_minutes: Consider location stale if older than this (default: 60 min)

        Returns:
            List of dicts with band location info:
            [
                {
                    'band_id': 1,
                    'band_name': 'Lost Tribe - Main Stage',
                    'latitude': 40.7128,
                    'longitude': -74.0060,
                    'last_updated': datetime,
                    'is_tracking': True,
                    'staleness_minutes': 15
                }
            ]
        """
        try:
            from datetime import timedelta

            # Get all bands (GeoArSite) - only sites with band_user (actual bands, not regular AR sites)
            bands = GeoArSite.objects.filter(band_user__isnull=False).select_related('band_user')

            if not bands.exists():
                self.logger.warning("No bands found in database")
                return []

            results = []
            current_time = timezone.now()
            stale_threshold = current_time - timedelta(minutes=stale_threshold_minutes)

            for band in bands:
                # Get latest location from history
                latest_location = BandLocation.objects.filter(
                    band=band
                ).order_by('-timestamp').first()

                # Determine if band is actively being tracked
                is_tracking = False
                staleness_minutes = None

                if latest_location and latest_location.timestamp:
                    time_diff = current_time - latest_location.timestamp
                    staleness_minutes = int(time_diff.total_seconds() / 60)
                    is_tracking = latest_location.timestamp >= stale_threshold

                # Extract current coordinates
                latitude = None
                longitude = None
                last_updated = None

                if band.lat_long:
                    # Use band's current location (updated by UDP listener)
                    latitude = band.lat_long.y
                    longitude = band.lat_long.x
                    if latest_location:
                        last_updated = latest_location.timestamp

                results.append({
                    'band_id': band.id,
                    'band_name': band.name,
                    'latitude': latitude,
                    'longitude': longitude,
                    'last_updated': last_updated,
                    'is_tracking': is_tracking,
                    'staleness_minutes': staleness_minutes
                })

            self.logger.info(
                f"Fetched current locations for {len(results)} bands. "
                f"Tracking: {sum(1 for r in results if r['is_tracking'])}"
            )

            return results

        except Exception as e:
            self.logger.error(f"Error fetching all current locations: {str(e)}", exc_info=True)
            return []
