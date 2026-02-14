"""
API Views for Band Tracking with comprehensive error handling.

Edge cases handled:
- Authentication and permission checks
- Invalid message IDs
- Duplicate send attempts
- Missing band IDs
- Invalid GPS strings
- Rate limiting (future enhancement)
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import BroadcastMessage, NotificationHistory, BandLocation
from .serializers import (
    BroadcastMessageSerializer,
    BroadcastMessageCreateSerializer,
    NotificationHistorySerializer,
    NotificationHistoryListSerializer,
    BandLocationSerializer,
    BandLocationUpdateSerializer,
    MessageStatsSerializer
)
from .services import BroadcastService, BandLocationService

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for list views"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class BroadcastMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing broadcast messages.

    Permissions:
    - Admin users can create, update, delete, and send messages
    - Regular users can view sent messages only

    Endpoints:
    - GET /messages/ - List all messages
    - POST /messages/ - Create new message
    - GET /messages/{id}/ - Retrieve message
    - PUT /messages/{id}/ - Update message (if not sent)
    - DELETE /messages/{id}/ - Soft delete message
    - POST /messages/{id}/send/ - Send message to all users
    - POST /messages/create_and_send/ - Create and send in one action
    - GET /messages/{id}/stats/ - Get message statistics
    """
    queryset = BroadcastMessage.objects.filter(is_deleted=False)
    serializer_class = BroadcastMessageSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        """
        Admin required for create, update, delete, send.
        Authenticated users can view sent messages.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'send', 'create_and_send']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Admin sees all messages.
        Regular users see only sent messages.
        """
        queryset = super().get_queryset()

        if not self.request.user.is_staff:
            # Regular users see only sent messages
            queryset = queryset.filter(sent_at__isnull=False)

        return queryset.select_related('created_by').order_by('-created_at')

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete"""
        if instance.is_sent:
            # Don't allow deleting sent messages
            return Response(
                {'error': 'Cannot delete sent messages'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def send(self, request, pk=None):
        """
        Send broadcast message to all users.

        Edge cases handled:
        - Message already sent
        - No active users
        - OneSignal failures
        """
        message = self.get_object()

        # Check if already sent
        if message.is_sent:
            return Response(
                {
                    'success': False,
                    'error': 'Message already sent',
                    'sent_at': message.sent_at
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Send broadcast
        service = BroadcastService()
        result = service.send_broadcast(message)

        if result.get('success'):
            # Reload message to get updated data
            message.refresh_from_db()
            serializer = self.get_serializer(message)

            response_data = {
                'success': True,
                'message': serializer.data,
                'recipients': result.get('recipients', 0),
                'delivered': result.get('delivered', 0),
                'failed': result.get('failed', 0)
            }

            if result.get('errors'):
                response_data['errors'] = result['errors']

            if result.get('warning'):
                response_data['warning'] = result['warning']

            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    'success': False,
                    'error': result.get('error', 'Unknown error occurred')
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def create_and_send(self, request):
        """
        Create and immediately send a broadcast message.

        Request body:
        {
            "title": "Message title",
            "content": "Message content",
            "send_immediately": true
        }
        """
        serializer = BroadcastMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create message
        message = BroadcastMessage.objects.create(
            title=serializer.validated_data['title'],
            content=serializer.validated_data['content'],
            created_by=request.user
        )

        # Send if requested
        if serializer.validated_data.get('send_immediately', False):
            service = BroadcastService()
            result = service.send_broadcast(message)

            message.refresh_from_db()
            message_serializer = BroadcastMessageSerializer(message)

            if result.get('success'):
                return Response(
                    {
                        'success': True,
                        'message': message_serializer.data,
                        'broadcast_result': result
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        'success': False,
                        'message': message_serializer.data,
                        'error': result.get('error', 'Broadcast failed'),
                        'broadcast_result': result
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Just created, not sent
            message_serializer = BroadcastMessageSerializer(message)
            return Response(
                {
                    'success': True,
                    'message': message_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get detailed statistics for a message.

        Returns delivery and read rates.
        """
        message = self.get_object()

        if not message.is_sent:
            return Response(
                {'error': 'Message not sent yet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        histories = message.notification_histories.all()
        total = histories.count()
        delivered = histories.filter(delivered=True).count()
        read_count = histories.filter(read=True).count()
        failed = histories.filter(delivered=False).count()

        stats = {
            'total_recipients': total,
            'delivered': delivered,
            'read': read_count,
            'failed': failed,
            'delivery_rate': round((delivered / total * 100) if total > 0 else 0, 2),
            'read_rate': round((read_count / total * 100) if total > 0 else 0, 2),
            'sent_at': message.sent_at
        }

        serializer = MessageStatsSerializer(stats)
        return Response(serializer.data)


class NotificationHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing notification history.

    Read-only - history is created automatically when messages are sent.

    Endpoints:
    - GET /history/ - List notification history
    - GET /history/{id}/ - Retrieve specific history entry
    """
    queryset = NotificationHistory.objects.all()
    serializer_class = NotificationHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Admin sees all history.
        Regular users see only their own history.
        """
        queryset = super().get_queryset()

        if not self.request.user.is_staff:
            # Regular users see only their own notifications
            queryset = queryset.filter(user=self.request.user)

        return queryset.select_related('message', 'user').order_by('-created_at')

    def get_serializer_class(self):
        """Use simplified serializer for list view"""
        if self.action == 'list':
            return NotificationHistoryListSerializer
        return NotificationHistorySerializer


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mark_message_read(request, notification_id):
    """
    Mark a notification as read for the current user.

    POST /notifications/{notification_id}/mark-read/

    Edge cases handled:
    - Notification doesn't exist
    - User doesn't own the notification
    - Already marked as read
    """
    try:
        history = NotificationHistory.objects.get(
            id=notification_id,
            user=request.user
        )

        if history.read:
            return Response(
                {
                    'success': True,
                    'message': 'Already marked as read',
                    'read_at': history.read_at
                },
                status=status.HTTP_200_OK
            )

        # Mark as read
        history.mark_as_read()

        return Response(
            {
                'success': True,
                'message': 'Marked as read',
                'read_at': history.read_at
            },
            status=status.HTTP_200_OK
        )

    except NotificationHistory.DoesNotExist:
        return Response(
            {
                'success': False,
                'error': 'Notification not found or you do not have access'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error marking message as read: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': 'An error occurred'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_notification_history(request):
    """
    Get current user's notification history.

    GET /user/notifications/

    Query params:
    - limit: Number of results (default: 50, max: 200)
    - unread_only: Show only unread notifications (default: false)
    """
    try:
        limit = int(request.GET.get('limit', 50))
        limit = min(limit, 200)  # Cap at 200

        unread_only = request.GET.get('unread_only', 'false').lower() == 'true'

        queryset = NotificationHistory.objects.filter(
            user=request.user
        ).select_related('message').order_by('-created_at')

        if unread_only:
            queryset = queryset.filter(read=False)

        histories = queryset[:limit]
        serializer = NotificationHistoryListSerializer(histories, many=True)

        return Response({
            'success': True,
            'count': len(histories),
            'unread_only': unread_only,
            'notifications': serializer.data
        })

    except Exception as e:
        logger.error(f"Error fetching user notifications: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': 'An error occurred'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def band_location_update(request):
    """
    Update band location from GPS string.

    POST /band/location/

    Request body:
    {
        "band_id": 1,  // Optional if authenticated as band user
        "gps_string": "40.7128,-74.0060",
        "auto_notify": true  // Optional, default true
    }

    Supported GPS formats:
    1. Simple: "latitude,longitude" e.g., "40.7128,-74.0060"
    2. NMEA: "$GPGGA,123519,4807.038,N,01131.000,E,..."

    Edge cases handled:
    - Invalid band_id
    - Invalid GPS string
    - Band not found
    - Service failures
    """
    try:
        serializer = BandLocationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        band_id = serializer.validated_data.get('band_id')
        gps_string = serializer.validated_data['gps_string']
        auto_notify = serializer.validated_data.get('auto_notify', True)

        # If band_id not provided, check if user is a band
        if not band_id:
            if hasattr(request.user, 'geo_ar_site_band_user'):
                band_id = request.user.geo_ar_site_band_user.id
            else:
                return Response(
                    {
                        'success': False,
                        'error': 'band_id is required or user must be a band'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Update location
        service = BandLocationService()
        result = service.update_location(band_id, gps_string, auto_notify)

        if result.get('success'):
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(
                result,
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        logger.error(f"Band location update error: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': f'Location update failed: {str(e)}'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def band_location_history(request, band_id):
    """
    Get location history for a specific band.

    GET /band/{band_id}/location-history/

    Query params:
    - limit: Number of results (default: 50, max: 200)
    """
    try:
        limit = int(request.GET.get('limit', 50))
        limit = min(limit, 200)

        service = BandLocationService()
        history = service.get_band_location_history(band_id, limit)

        return Response({
            'success': True,
            'band_id': band_id,
            'count': len(history),
            'history': history
        })

    except Exception as e:
        logger.error(f"Error fetching location history: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': 'An error occurred'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def all_band_locations_current(request):
    """
    Get current location for ALL bands (for map display).

    GET /band/locations/current/

    Query params:
    - stale_minutes: Consider location stale if older than this (default: 60)

    Returns:
    {
        "success": true,
        "timestamp": "2024-01-15T10:30:00Z",
        "total_bands": 4,
        "tracking_bands": 3,
        "bands": [
            {
                "band_id": 1,
                "band_name": "Lost Tribe - Main Stage",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "last_updated": "2024-01-15T10:29:45Z",
                "is_tracking": true,
                "staleness_minutes": 1
            }
        ]
    }

    Edge cases handled:
    - No bands in database
    - Bands without GPS data (returns null lat/lng)
    - Stale location data (is_tracking = false)
    - Service failures
    """
    try:
        # Get stale threshold from query params
        stale_minutes = int(request.GET.get('stale_minutes', 60))
        stale_minutes = max(1, min(stale_minutes, 1440))  # Clamp between 1 and 1440 (24 hours)

        # Fetch all current locations
        service = BandLocationService()
        bands_data = service.get_all_current_locations(stale_threshold_minutes=stale_minutes)

        # Count tracking bands
        tracking_count = sum(1 for band in bands_data if band['is_tracking'])

        response_data = {
            'success': True,
            'timestamp': timezone.now(),
            'total_bands': len(bands_data),
            'tracking_bands': tracking_count,
            'bands': bands_data
        }

        # Use serializer for validation and consistent format
        from .serializers import AllBandLocationsResponseSerializer
        serializer = AllBandLocationsResponseSerializer(response_data)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError as e:
        # Invalid query param
        logger.error(f"Invalid query parameter: {str(e)}")
        return Response(
            {
                'success': False,
                'error': 'Invalid query parameter'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        logger.error(f"Error fetching all band locations: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': 'An error occurred while fetching band locations'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
