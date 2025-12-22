# Django
from django.conf import settings
# Others
from onesignal_sdk.client import Client
import json
import logging


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
        
        # Add from_user_id and profile image if available
        if notification.from_user:
            data["from_user_id"] = notification.from_user.id
            data["from_user_name"] = notification.from_user.name or notification.from_user.username
            
            # Add user profile image if available
            if hasattr(notification.from_user, 'user_profile'):
                profile = notification.from_user.user_profile
                data["from_user_profile"] = {
                    "image": profile.get_image_url(),
                }

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
