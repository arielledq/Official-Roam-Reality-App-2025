# Django
from django.conf import settings
# Others
from onesignal_sdk.client import Client
import json
import logging

# Local
from users.models import get_placeholder_image_base64


LOGGER = logging.getLogger('django')


class OneSignalClient:
    """
    Wrapper class for the OneSignal client.
    """

    def __init__(self):
        """
        Initializes the OneSignal client with the provided configuration.
        """
        self.os_client = Client(
            rest_api_key=settings.ONESIGNAL_REST_API_KEY,
            app_id=settings.ONESIGNAL_APP_ID,
            user_auth_key=settings.ONESIGNAL_USER_AUTH_KEY
        )

    def send_push_notification(self, notification, devices_ids=None):
        """
        Sends a push notification using the OneSignal client.

        Args:
            notification (Notification): The notification object to send.
            devices_ids (list, optional): List of device IDs to target. Defaults to None.
        """
        if devices_ids is not None and not len(devices_ids):
            return

        # Parse extra_data if it's a string
        extra_data_dict = {}
        if notification.extra_data:
            try:
                if isinstance(notification.extra_data, str):
                    extra_data_dict = json.loads(notification.extra_data)
                else:
                    extra_data_dict = notification.extra_data
            except (json.JSONDecodeError, TypeError):
                extra_data_dict = {}

        # Add notification type and from_user_id to data
        data = {
            "notification_type": notification.type,
            "notification_id": notification.id,
            **extra_data_dict
        }
        
        # Add from_user, from_user_id and profile image if available
        # These fields override any values from extra_data_dict to ensure consistency
        if notification.from_user:
            data["from_user"] = notification.from_user.name or notification.from_user.username
            data["from_user_id"] = notification.from_user.id

            # Add user profile image if available; always include a value (placeholder if missing)
            profile_image_url = None
            try:
                profile = notification.from_user.user_profile  # may raise RelatedObjectDoesNotExist
                profile_image_url = profile.get_image_url()
            except Exception as e:
                LOGGER.warning(f"User {notification.from_user.id} has no profile image, using placeholder: {e}")
                profile_image_url = get_placeholder_image_base64()

            if profile_image_url:
                data["from_user_profile"] = {
                    "image": profile_image_url,
                }
                LOGGER.info(f"Added from_user_profile with image: {profile_image_url}")

            LOGGER.info(f"Added from_user data - from_user: {data['from_user']}, from_user_id: {data['from_user_id']}")
        else:
            LOGGER.info("Notification has no from_user")

        # Build notification payload
        notification_payload = {
            "headings": {"en": notification.title, "es": notification.title},
            "contents": {"en": notification.description, "es": notification.description},
            "content_available": True,
            "data": data
        }

        # Add action buttons for friend request notifications
        from notifications.models import NotificationTypes
        if notification.type == NotificationTypes.FRIEND_REQUEST_SENT:
            notification_payload["buttons"] = [
                {"id": "accept", "text": "Accept"},
                {"id": "reject", "text": "Reject"}
            ]
            notification_payload["data"]["action"] = "friend_request"
            notification_payload["data"]["kind"] = "friend_request"

        if devices_ids:
            notification_payload.update({"include_player_ids": devices_ids})
        else:
            notification_payload.update({"included_segments": ['Subscribed Users']})
        
        try:
            self.os_client.send_notification(notification_payload)
            LOGGER.info('Notification sent. notification: {}'.format(json.dumps(notification_payload)))
        except Exception as e:
            print('print Push sending failed: {}'.format(e))
            LOGGER.info('logger Push sending failed: {}'.format(e))
            if hasattr(e, 'message'):
                LOGGER.info('logger message Push sending failed: {}'.format(e.message))
            raise e

    def send_notification(self, device_ids, title, content, data=None, included_segments=None):
        """
        Send a standard push notification with popup.
        Generic method for sending notifications without requiring a Notification model object.

        Args:
            device_ids (list): List of device IDs to target
            title (str): Notification title/heading
            content (str): Notification content/body
            data (dict, optional): Additional data payload
            included_segments (list, optional): Segments to target if device_ids not provided

        Returns:
            dict: OneSignal response or None if failed

        Example:
            client.send_notification(
                device_ids=['player_id_1', 'player_id_2'],
                title='Band 1 is moving!',
                content='Check the map to see their new location',
                data={'message_id': 123, 'type': 'broadcast'}
            )
        """
        if not device_ids and not included_segments:
            LOGGER.warning("No device_ids or segments provided for notification")
            return None

        if device_ids is not None and not len(device_ids):
            LOGGER.warning("Empty device_ids list provided for notification")
            return None

        # Build notification payload
        notification_payload = {
            "headings": {"en": title},
            "contents": {"en": content},
            "content_available": True,
            "data": data or {}
        }

        # Target devices or segments
        if device_ids:
            notification_payload["include_player_ids"] = device_ids
        elif included_segments:
            notification_payload["included_segments"] = included_segments

        try:
            response = self.os_client.send_notification(notification_payload)
            LOGGER.info(f'Notification sent to {len(device_ids) if device_ids else "all"} devices. Title: {title}')

            # Convert response object to dict
            if response:
                return {
                    'id': getattr(response, 'id', None),
                    'recipients': getattr(response, 'recipients', 0),
                    'external_id': getattr(response, 'external_id', None)
                }
            return None
        except Exception as e:
            LOGGER.error(f'Notification sending failed: {e}')
            if hasattr(e, 'message'):
                LOGGER.error(f'Error message: {e.message}')
            return None

    def send_silent_data(self, device_ids, data, included_segments=None):
        """
        Send a silent data-only notification (no popup, no sound).
        Perfect for real-time location updates without disturbing the user.

        Args:
            device_ids (list): List of device IDs to target
            data (dict): Data payload to send to the app
            included_segments (list, optional): Segments to target if device_ids not provided

        Returns:
            dict: OneSignal response or None if failed

        Example:
            client.send_silent_data(
                device_ids=['player_id_1', 'player_id_2'],
                data={
                    'type': 'location_update',
                    'band_id': 1,
                    'band_name': 'Band 1',
                    'latitude': 40.7128,
                    'longitude': -74.0060,
                    'timestamp': '2024-01-15T10:03:00Z'
                }
            )
        """
        if not device_ids and not included_segments:
            LOGGER.warning("No device_ids or segments provided for silent notification")
            return None

        if device_ids is not None and not len(device_ids):
            LOGGER.warning("Empty device_ids list provided for silent notification")
            return None

        # Silent notification payload
        # Key: NO "headings" or "contents" = no popup!
        notification_payload = {
            "content_available": True,  # iOS: wake app in background
            "priority": 10,              # Android: high priority for immediate delivery
            "data": data,                # Custom data payload
            "ios_badgeType": "None",     # Don't update badge count
            "android_channel_id": "silent_updates"  # Use silent channel
        }

        # Target devices or segments
        if device_ids:
            notification_payload["include_player_ids"] = device_ids
        elif included_segments:
            notification_payload["included_segments"] = included_segments

        try:
            response = self.os_client.send_notification(notification_payload)
            LOGGER.info(f'Silent data notification sent to {len(device_ids) if device_ids else "all"} devices. Data: {json.dumps(data)}')

            # Convert response object to dict
            if response:
                return {
                    'id': getattr(response, 'id', None),
                    'recipients': getattr(response, 'recipients', 0),
                    'external_id': getattr(response, 'external_id', None)
                }
            return None
        except Exception as e:
            LOGGER.error(f'Silent notification sending failed: {e}')
            if hasattr(e, 'message'):
                LOGGER.error(f'Error message: {e.message}')
            return None
