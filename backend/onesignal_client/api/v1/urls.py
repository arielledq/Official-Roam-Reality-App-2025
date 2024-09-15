from django.urls import path, include
from rest_framework.routers import DefaultRouter

from onesignal_client.api.v1.viewsets import SetDeviceViewset

router = DefaultRouter()

#
# router.register("set-device", SetDeviceViewset, basename="set-device")
#
# urlpatterns = [
#     path("", include(router.urls)),
# ]
