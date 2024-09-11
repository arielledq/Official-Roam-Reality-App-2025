from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from onesignal_client.api.v1.serializers import UserIdPushTokenSerializer
from onesignal_client.models import UserDevice
from onesignal_client.views import PostViewsetMixin


class SetDeviceViewset(PostViewsetMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserIdPushTokenSerializer

    def perform_post(self, serializer):
        user = self.request.user
        data = serializer.validated_data
        #
        if data['active']:
            devices = UserDevice.objects.filter(device_id=data.get('userId')).exclude(user=user)
            if devices:
                for device in devices:
                    device.active = False
                    device.save()
            UserDevice.activate_device(user, data.get('userId'), data.get('pushToken'))
        else:
            UserDevice.deactivate_all_devices(user)
