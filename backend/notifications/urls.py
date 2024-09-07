from django.urls import path, include
from rest_framework.routers import DefaultRouter

from notifications.views import SetDeviceViewset, NotificationsView

router = DefaultRouter()


router.register("set-device", SetDeviceViewset, basename="set-device")
router.register("notifications", NotificationsView, basename="notifications")

urlpatterns = [
    path("", include(router.urls)),
]
