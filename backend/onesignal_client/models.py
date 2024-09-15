from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class UserDevice(models.Model):
    """
    Model used to send notifications to user devices
    The active field is used to determine if the user has notifications enabled on the device
    """
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='devices')
    device_id = models.CharField('Device Id', max_length=64)
    device_token = models.CharField('Device token', max_length=200, null=True, blank=True)
    active = models.BooleanField(default=True)
    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User device'
        ordering = ['-id']
        unique_together = ['user', 'device_id']

    @staticmethod
    def activate_device(user, device_id, device_token):
        if not device_id:
            return
        try:
            device = user.devices.get(device_id=device_id)
            device.active = True
            device.device_token = device_token
            device.save()
        except UserDevice.DoesNotExist:
            UserDevice.objects.create(
                user=user,
                device_id=device_id,
                device_token=device_token
            )

    @staticmethod
    def deactivate_device(user, device_id):
        if not device_id:
            return
        try:
            device = user.devices.get(device_id=device_id)
            device.active = False
            device.save()
        except UserDevice.DoesNotExist:
            pass

    @staticmethod
    def deactivate_all_devices(user):
        devices = user.devices.all()
        for device in devices:
            device.active = False
            device.save()

    def __str__(self):
        return "{} - {}".format(self.device_id, self.user.username)