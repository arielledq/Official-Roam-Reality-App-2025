from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import SlidePictureViewSet

router = DefaultRouter()
router.register("slide-pictures", SlidePictureViewSet, basename="slide-pictures")

urlpatterns = [
    path("", include(router.urls)),
]
