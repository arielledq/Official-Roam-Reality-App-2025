
from django.urls import path, include
from rest_framework import routers

from .viewsets import ChallengesViewSet, ChallengesUploadView, SponsorViewSet


router = routers.DefaultRouter()
router.register(r'user', ChallengesViewSet)
router.register(r'sponsor', SponsorViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('upload_model/', ChallengesUploadView.as_view()),
]