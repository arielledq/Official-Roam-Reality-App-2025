
from django.urls import path, include
from rest_framework import routers
from . import signals  # noqa
from .viewsets import ChallengesViewSet, ChallengesUploadView, SponsorViewSet, Resource3dModelViewSet, ARProfileViewSet, ARMemoriesViewSet


router = routers.DefaultRouter()
router.register(r'user', ChallengesViewSet)
router.register(r'ar-profile', ARProfileViewSet, basename="ar-profile")
router.register(r'sponsor', SponsorViewSet)
router.register(r'memories', ARMemoriesViewSet, basename="ar-memories")
router.register(r'resource', Resource3dModelViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('upload_model/', ChallengesUploadView.as_view()),
]