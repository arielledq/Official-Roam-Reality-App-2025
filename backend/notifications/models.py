# Django
# Others
import logging
from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import models

from onesignal_client.client import OneSignalClient

User = get_user_model()
LOGGER = logging.getLogger('django')


class NotificationError(models.Model):
    """
    Model to store notification errors.
    """
    target = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    notification = models.ForeignKey("Notification", on_delete=models.CASCADE, null=True, blank=True,
                                     related_name="send_notification_errors")
    message = models.TextField(null=True)


class Notification(models.Model):
    """
    Model to represent notifications and handle their sending.
    """
    targets = models.ManyToManyField(User, blank=True,
                                     related_name="notifications_to_user")
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,
                                  related_name="notifications_from_user")
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    sent_timestamp = models.DateTimeField(null=True)
    extra_data = models.TextField(null=True, blank=True)
    sent = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

    class NotificationChannel(models.IntegerChoices):
        EMAIL = (1, 'EMAIL')
        SMS = (2, 'SMS')
        PUSH = (3, 'PUSH')

    channel = models.IntegerField(
        choices=NotificationChannel.choices,
        default=NotificationChannel.PUSH
    )

    class NotificationType(models.IntegerChoices):
        DEFAULT = (1, 'DEFAULT')
        CONNECTIONS = (2, 'CONNECTIONS')
        REVIEWS = (3, 'REVIEWS')
        TASKS = (4, 'TASKS')
        FEEDBACK = (5, 'FEEDBACK')

    type = models.IntegerField(
        choices=NotificationType.choices,
        default=NotificationType.DEFAULT
    )

    def register_error(self, message, user):
        """
       Register an error for the notification.

       Args:
           message (str): The error message.
           user (User): The target user associated with the error.
       """
        NotificationError.objects.create(
            target=user,
            notification=self,
            message=message,
        )

    def send(self):
        """
       Send the notification to the specified users.

       Args:
           users (QuerySet or list): Users to whom the notification should be sent.
       """
        users = self.targets.all()
        if not isinstance(users, models.QuerySet) and not isinstance(users, list):
            users = [users]

        for user in users:
            devices = user.devices.filter(active=True)
            if not devices.exists():
                error_message = 'The user {} doesnt have any active devices '.format(user.username)
                LOGGER.warning(error_message)
                self.register_error(error_message, user)
                continue
            try:
                if self.channel == Notification.NotificationChannel.PUSH:
                    os_client = OneSignalClient()
                    os_client.send_push_notification(self, list(devices.values_list('device_id', flat=True)))
                self.sent = True
                self.sent_timestamp = datetime.now()
                self.save()
            except Exception as e:
                self.register_error(str(e), user)

    def __str__(self):
        from_user = self.from_user.name if self.from_user else ''
        return '{} - from {}'.format(self.id, from_user)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-id']
