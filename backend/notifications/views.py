from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from onesignal_client.api.v1.serializers import UserIdPushTokenSerializer
from onesignal_client.models import UserDevice
from utils.utils import may_fail, DefaultPagination
from onesignal_client.views import PostViewsetMixin


class SetDeviceViewset(PostViewsetMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserIdPushTokenSerializer

    def perform_post(self, serializer):
        user = self.request.user
        data = serializer.validated_data
        #
        if data['active']:
            devices = UserDevice.objects.filter(device_id=data.get('user_id')).exclude(user=user)
            if devices:
                for device in devices:
                    device.active = False
                    device.save()
            UserDevice.activate_device(user, data.get('user_id'), data.get('push_token'))
        else:
            UserDevice.deactivate_all_devices(user)


class NotificationsView(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset().filter(targets__in=[user]).order_by('is_read', '-id')
        return queryset

    @action(detail=True, methods=["POST"])
    @may_fail(Notification.DoesNotExist, 'Notification not found')
    def mark_as_read(self, request, pk=None):
        notification = self.queryset.get(id=pk)
        notification.is_read = True
        notification.save()
        return Response()

    @action(detail=False, methods=["POST"])
    @may_fail(Notification.DoesNotExist, 'Notification not found')
    def read_all(self, request, pk=None):
        notifications_to_mark_as_read = Notification.objects.filter(targets=request.user)
        notifications_to_mark_as_read.update(is_read=True)

        return Response()

