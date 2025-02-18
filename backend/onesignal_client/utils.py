from notifications.models import Notification, NotificationTypes


def send_notification(notification_type, user, data=None, extra_data=None, title=None, description=None):
    if data is None:
        data = {}
    if extra_data is None:
        extra_data = {}

    notification_mapping = {
        NotificationTypes.AR_SITE_NEARBY: {
            'title': 'AR Site Nearby',
            'description': 'You’re close to an exciting AR site! Open the app to explore and find it!'
        },
        NotificationTypes.STAR_NEARBY: {
            'title': 'Start Nearby',
            'description': 'STAR_NEARBY'
        },
        NotificationTypes.AR_EXPERIENCE_NEARBY: {
            'title': 'AR Experience Nearby',
            'description': 'You’re within 100M range of an AR experience! Open the app to explore and find it!'
        },
        NotificationTypes.FRIEND_ROAMING_ONLINE: {
            'title': 'Your friends are Roaming!',
            'description': 'Your friends are roaming! Check out who it is now!'
        },
        NotificationTypes.POINTS_REVOKED: {
            'title': 'Points Revoked!',
            'description': 'Unfortunately one of your AR experiences has violated the rules, it has been removed '
                           'and your points revoked. Feel free to contact us if you would like more information.'
        },
        NotificationTypes.FRIEND_REQUEST_SENT: {
            'title': 'Friend Request',
            'description': 'You have received a new friend request!'
        },
        NotificationTypes.FRIEND_REQUEST_ACCEPTED: {
            'title': 'Friend Request Accepted',
            'description': f'Your friend {extra_data.get("friend_name")} request has been accepted!'
        },
        NotificationTypes.EXPERIENCE_ABOUT_EXPIRE: {
            'title': 'AR Experience About to Expire',
            'description': f'The {extra_data.get("experience_name")} is about to expire, hurry before it’s too late!'
        },
        NotificationTypes.REFRESH_APP_REMINDER: {
            'title': 'Refresh App Reminder',
            'description': 'Remember to refresh the app regularly to access the latest updates and new experiences!'
        },
        NotificationTypes.DEFAULT: {
            'title': title,
            'description': description
        },
    }

    # Get the notification details based on the type
    notification_details = notification_mapping.get(notification_type)

    notification = Notification.objects.create(
        title=notification_details['title'],
        description=notification_details['description'],
        extra_data=extra_data,
        type=notification_type,
    )
    notification.targets.set([user])
    notification.send()

