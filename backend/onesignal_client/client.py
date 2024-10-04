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

        notification = {
            "headings": {"en": notification.title, "es": notification.title},
            "contents": {"en": notification.description, "es": notification.description},
            "content_available": True,
            "data": json.loads(json.dumps(notification.extra_data)) if notification.extra_data != '' else {}
        }
        if devices_ids:
            notification.update({"include_player_ids": devices_ids})
        else:
            notification.update({"included_segments": ['Subscribed Users']})
        try:
            self.os_client.send_notification(notification)
            LOGGER.info('Notification sent. notification: {}'.format(json.dumps(notification)))
        except Exception as e:
            print('print Push sending failed: {}'.format(e))
            LOGGER.info('logger Push sending failed: {}'.format(e))
            LOGGER.info('logger message Push sending failed: {}'.format(e.message))
            raise e
