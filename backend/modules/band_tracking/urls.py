"""
URL routing for Band Tracking API.

All endpoints are under /api/v1/band/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router for ViewSets
router = DefaultRouter()
router.register(r'messages', views.BroadcastMessageViewSet, basename='broadcast-message')
router.register(r'history', views.NotificationHistoryViewSet, basename='notification-history')

# URL patterns
urlpatterns = [
    # ViewSet routes (messages and history)
    path('', include(router.urls)),

    # Custom endpoints
    path(
        'notifications/<int:notification_id>/mark-read/',
        views.mark_message_read,
        name='mark-notification-read'
    ),
    path(
        'user/notifications/',
        views.user_notification_history,
        name='user-notifications'
    ),
    path(
        'location/',
        views.band_location_update,
        name='band-location-update'
    ),
    path(
        'location/<int:band_id>/history/',
        views.band_location_history,
        name='band-location-history'
    ),
    path(
        'locations/current/',
        views.all_band_locations_current,
        name='all-band-locations-current'
    ),
]

"""
Complete API endpoint list:

Broadcast Messages:
- GET    /api/v1/band/messages/                      - List messages
- POST   /api/v1/band/messages/                      - Create message
- GET    /api/v1/band/messages/{id}/                 - Retrieve message
- PUT    /api/v1/band/messages/{id}/                 - Update message
- DELETE /api/v1/band/messages/{id}/                 - Delete message
- POST   /api/v1/band/messages/{id}/send/            - Send message to all users
- POST   /api/v1/band/messages/create_and_send/      - Create and send
- GET    /api/v1/band/messages/{id}/stats/           - Message statistics

Notification History:
- GET    /api/v1/band/history/                       - List notification history
- GET    /api/v1/band/history/{id}/                  - Retrieve history entry

User Endpoints:
- POST   /api/v1/band/notifications/{id}/mark-read/  - Mark notification as read
- GET    /api/v1/band/user/notifications/            - User's notifications

Band Location:
- POST   /api/v1/band/location/                      - Update band location (3rd party)
- GET    /api/v1/band/location/{band_id}/history/    - Location history for one band
- GET    /api/v1/band/locations/current/             - Current locations for ALL bands (for map)
"""
