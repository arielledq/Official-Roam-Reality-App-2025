"""
Django management command to listen for GPS updates via UDP.

Usage:
    python manage.py listen_gps_updates [--port 8001] [--host 0.0.0.0]

This command:
1. Creates a UDP socket listening on specified port (default: 8001)
2. Receives GPS data packets from third-party GPS provider
3. Parses vehicle ID and GPS coordinates
4. Validates vehicle against whitelist (from database)
5. Updates band location using BandLocationService
6. Triggers auto-notifications if band moved significantly

Expected packet format:
    VEHICLE_ID:GPS_STRING

Examples:
    LT01:40.7128,-74.0060
    LT01:$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47

Features:
- Admin-configurable vehicle whitelist (no hardcoding!)
- Database-driven settings (distance threshold, cooldown, etc.)
- Comprehensive error handling and logging
- Graceful shutdown on SIGTERM/SIGINT
- Connection pooling management
"""
import socket
import signal
import sys
import logging
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from modules.band_tracking.services import BandLocationService
from modules.band_tracking.models import VehicleWhitelist

logger = logging.getLogger('gps_listener')


class Command(BaseCommand):
    help = 'Listen for GPS updates from third-party provider via UDP on port 8001'

    def add_arguments(self, parser):
        """Add command line arguments"""
        parser.add_argument(
            '--port',
            type=int,
            default=8001,
            help='UDP port to listen on (default: 8001)'
        )
        parser.add_argument(
            '--host',
            type=str,
            default='0.0.0.0',
            help='Host to bind to (default: 0.0.0.0 for all interfaces)'
        )
        parser.add_argument(
            '--buffer-size',
            type=int,
            default=1024,
            help='UDP receive buffer size in bytes (default: 1024)'
        )

    def __init__(self):
        super().__init__()
        self.sock = None
        self.running = False
        self.service = BandLocationService()
        self.packet_count = 0

    def handle(self, *args, **options):
        """Main command handler"""
        port = options['port']
        host = options['host']
        buffer_size = options['buffer_size']

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)

        try:
            # Create UDP socket
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

            # Bind to port
            self.sock.bind((host, port))
            self.running = True

            self.stdout.write(
                self.style.SUCCESS(f'GPS UDP Listener started on {host}:{port}')
            )
            logger.info(f'GPS UDP Listener started on {host}:{port}')

            # Log vehicle whitelist at startup
            self._log_vehicle_whitelist()

            # Main listening loop
            while self.running:
                try:
                    # Receive UDP packet
                    data, addr = self.sock.recvfrom(buffer_size)
                    self.packet_count += 1

                    # Decode packet
                    packet_str = data.decode('utf-8').strip()
                    logger.info(f"[Packet #{self.packet_count}] Received from {addr[0]}:{addr[1]}: {packet_str[:100]}")

                    # Process packet
                    self._process_gps_packet(packet_str, addr)

                    # Periodically close database connection to prevent leaks
                    if self.packet_count % 100 == 0:
                        connection.close()
                        logger.debug(f"Database connection closed after {self.packet_count} packets")

                except OSError as e:
                    # Socket was closed (likely by signal handler)
                    if not self.running:
                        break
                    logger.error(f"Socket error: {e}")
                    break
                except UnicodeDecodeError as e:
                    logger.error(f"Failed to decode packet from {addr}: {e}")
                except Exception as e:
                    logger.error(f"Error processing packet: {e}", exc_info=True)
                    # Continue listening even if one packet fails

        except socket.error as e:
            if e.errno == 98:  # Address already in use
                raise CommandError(
                    f'Port {port} is already in use. '
                    f'Check if another instance is running: sudo netstat -ulnp | grep {port}'
                )
            elif e.errno == 13:  # Permission denied
                raise CommandError(
                    f'Permission denied to bind to port {port}. '
                    f'Ports below 1024 require root privileges.'
                )
            else:
                raise CommandError(f'Socket error: {e}')

        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\nShutdown requested by user'))
            logger.info('Shutdown requested by user')

        except Exception as e:
            logger.error(f'Unexpected error: {e}', exc_info=True)
            raise CommandError(f'Unexpected error: {e}')

        finally:
            self._cleanup()

    def _process_gps_packet(self, packet_str: str, addr: tuple):
        """
        Process a GPS packet.

        Expected format: VEHICLE_ID:GPS_STRING
        Example: LT01:40.7128,-74.0060

        Args:
            packet_str: The decoded packet string
            addr: Tuple of (ip_address, port)
        """
        try:
            # Validate packet format
            if ':' not in packet_str:
                logger.warning(
                    f"Invalid packet format (missing ':'): {packet_str[:100]} from {addr[0]}"
                )
                return

            # Split into vehicle ID and GPS string
            parts = packet_str.split(':', 1)
            if len(parts) != 2:
                logger.warning(
                    f"Invalid packet format (expected VEHICLE_ID:GPS_STRING): {packet_str[:100]}"
                )
                return

            vehicle_id = parts[0].strip().upper()
            gps_string = parts[1].strip()

            logger.debug(f"Parsed - Vehicle ID: {vehicle_id}, GPS: {gps_string[:50]}")

            # Validate vehicle ID against whitelist (from database)
            try:
                vehicle = VehicleWhitelist.objects.select_related('band').get(
                    vehicle_id=vehicle_id,
                    is_active=True
                )
                band_id = vehicle.band_id
                band_name = vehicle.band.name

                logger.info(
                    f"✓ Vehicle {vehicle_id} validated → Band: {band_name} (ID: {band_id})"
                )

            except VehicleWhitelist.DoesNotExist:
                logger.warning(
                    f"✗ Unknown or disabled vehicle ID: {vehicle_id}. "
                    f"Add this vehicle to whitelist in Django admin."
                )
                return

            # Update location using service
            result = self.service.update_location(
                band_id=band_id,
                gps_string=gps_string,
                auto_notify=True
            )

            if result.get('success'):
                lat = result['location']['lat']
                lng = result['location']['lng']
                distance = result.get('distance_meters', 0)
                moved = result.get('moved_significantly', False)
                notified = result.get('notification_sent', False)

                status_msg = f"✓ Updated {band_name}: ({lat:.6f}, {lng:.6f})"

                if moved:
                    status_msg += f" - Moved {distance:.1f}m"
                    if notified:
                        status_msg += " - Notification sent"
                    else:
                        status_msg += " - Notification skipped (cooldown or disabled)"

                logger.info(status_msg)
                self.stdout.write(self.style.SUCCESS(status_msg))

            else:
                error_msg = result.get('error', 'Unknown error')
                logger.error(f"✗ Failed to update {vehicle_id}: {error_msg}")
                self.stdout.write(self.style.ERROR(f"Failed to update {vehicle_id}: {error_msg}"))

        except Exception as e:
            logger.error(f"Error processing GPS packet: {e}", exc_info=True)

    def _log_vehicle_whitelist(self):
        """Log current vehicle whitelist at startup"""
        try:
            vehicles = VehicleWhitelist.objects.filter(is_active=True).select_related('band')
            vehicle_count = vehicles.count()

            if vehicle_count == 0:
                logger.warning(
                    "⚠️  No active vehicles in whitelist! "
                    "Add vehicles in Django admin: /admin/band_tracking/vehiclewhitelist/"
                )
                self.stdout.write(
                    self.style.WARNING(
                        "Warning: No active vehicles in whitelist. "
                        "All incoming packets will be rejected."
                    )
                )
            else:
                logger.info(f"Vehicle whitelist loaded: {vehicle_count} active vehicle(s)")
                for vehicle in vehicles:
                    logger.info(f"  ✓ {vehicle.vehicle_id} → {vehicle.band.name}")
                    self.stdout.write(f"  • {vehicle.vehicle_id} → {vehicle.band.name}")

        except Exception as e:
            logger.error(f"Error loading vehicle whitelist: {e}")

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        signal_name = 'SIGTERM' if signum == signal.SIGTERM else 'SIGINT'
        logger.info(f'Received {signal_name}, shutting down gracefully...')
        self.stdout.write(self.style.WARNING(f'\nReceived {signal_name}, shutting down...'))
        self.running = False

        # Close socket to unblock recvfrom()
        if self.sock:
            try:
                self.sock.close()
            except Exception:
                pass

    def _cleanup(self):
        """Cleanup resources"""
        logger.info(f'GPS Listener stopping. Total packets processed: {self.packet_count}')
        self.stdout.write(
            self.style.SUCCESS(f'GPS Listener stopped. Processed {self.packet_count} packets.')
        )

        # Close socket
        if self.sock:
            try:
                self.sock.close()
                logger.info('UDP socket closed')
            except Exception as e:
                logger.error(f'Error closing socket: {e}')

        # Close database connections
        try:
            connection.close()
            logger.info('Database connections closed')
        except Exception as e:
            logger.error(f'Error closing database connection: {e}')
