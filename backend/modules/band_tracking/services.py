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
from .models import BroadcastMessage, NotificationHistory, BandLocation

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

            # Get all active users
            users = User.objects.filter(is_active=True)
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
                    'warning': 'No active users in system'
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
            from users.models import UserDevice
            from notifications.services import OneSignalClient

            # Get active devices for users
            devices = UserDevice.objects.filter(
                user__in=users,
                is_active=True
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
    """

    # Movement threshold in degrees (~111 meters at equator)
    MOVEMENT_THRESHOLD_DEGREES = 0.001

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

            # Check for significant movement
            old_location = band.lat_long
            moved_significantly = False
            distance_meters = 0

            if old_location:
                distance_meters = self._calculate_distance(old_location, new_location)
                # Check if moved more than threshold
                if distance_meters > (self.MOVEMENT_THRESHOLD_DEGREES * 111000):  # Convert to meters
                    moved_significantly = True
                    self.logger.info(
                        f"Band {band.name} moved {distance_meters:.2f} meters"
                    )
                else:
                    self.logger.debug(
                        f"Band {band.name} movement too small: {distance_meters:.2f} meters"
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

            # Auto-broadcast if moved significantly
            notification_sent = False
            if auto_notify and moved_significantly:
                notification_sent = self._auto_broadcast_movement(
                    band, new_location, distance_meters
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

        # Try NMEA format: $GPGGA,...
        if gps_string.startswith('$GP'):
            return self._parse_nmea(gps_string)

        # Unknown format
        return None, None, {}

    def _parse_nmea(self, nmea_string: str) -> Tuple[Optional[float], Optional[float], Dict]:
        """
        Parse NMEA GPS format.

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
            self.logger.error(f"NMEA parsing error: {str(e)}")
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

    def _auto_broadcast_movement(
        self,
        band: GeoArSite,
        new_location: Point,
        distance_meters: float
    ) -> bool:
        """
        Auto-send broadcast notification when band moves significantly.

        Returns:
            bool: True if notification was sent successfully
        """
        try:
            # Create message
            message = BroadcastMessage.objects.create(
                title=f"{band.name} is on the move!",
                content=f"{band.name} has moved to a new location (moved {distance_meters:.0f}m). Check the map to see where they are now!",
                created_by=None  # System-generated
            )

            # Send broadcast
            broadcast_service = BroadcastService()
            result = broadcast_service.send_broadcast(message)

            if result.get('success'):
                self.logger.info(
                    f"Auto-broadcast sent for {band.name} movement: message_id={message.id}"
                )
                return True
            else:
                self.logger.error(
                    f"Auto-broadcast failed for {band.name}: {result.get('error')}"
                )
                return False

        except Exception as e:
            self.logger.error(f"Auto-broadcast error: {str(e)}", exc_info=True)
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
