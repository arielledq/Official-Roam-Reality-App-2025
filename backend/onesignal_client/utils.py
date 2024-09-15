from notifications.models import Notification, NotificationTypes


def send_notification(notification_type, user, data=None, extra_data=None):
    if data is None:
        data = {}
    if extra_data is None:
        extra_data = {}

    notification_mapping = {
        NotificationTypes.AR_SITE_NEARBY: {
            'title': 'AR Site Nearby',
            'description': 'AR_SITE_NEARBY'
        },
        NotificationTypes.STAR_NEARBY: {
            'title': 'Start Nearby',
            'description': 'STAR_NEARBY'
        },
        NotificationTypes.FRIEND_ROAMING_ONLINE: {
            'title': 'Friend Roaming Online',
            'description': 'FRIEND_ROAMING_ONLINE'
        },
        NotificationTypes.POINTS_REVOKED: {
            'title': 'Points Revoked',
            'description': 'POINTS_REVOKED'
        },
        NotificationTypes.FRIEND_REQUEST_SENT: {
            'title': 'Friend Request Sent',
            'description': 'FRIEND_REQUEST_SENT'
        },
        NotificationTypes.FRIEND_REQUEST_ACCEPTED: {
            'title': 'Friend Request Accepted',
            'description': 'FRIEND_REQUEST_ACCEPTED'
        },
        NotificationTypes.EXPERIENCE_ABOUT_EXPIRE: {
            'title': 'Experience About to Expire',
            'description': 'EXPERIENCE_ABOUT_EXPIRE'
        },
        NotificationTypes.REFRESH_APP_REMINDER: {
            'title': 'Refresh App Reminder',
            'description': 'REFRESH_APP_REMINDER'
        },
    }

    # Get the notification details based on the type
    notification_details = notification_mapping.get(notification_type)

    notification = Notification.objects.create(
        title=notification_details['title'],
        description=notification_details['description'],
        extra_data=extra_data
    )
    notification.targets.set([user])
    notification.send()

