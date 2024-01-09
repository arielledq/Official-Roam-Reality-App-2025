
from django.urls import path, include
from rest_framework import routers

from .viewsets import ChallengesViewSet, ChallengesUploadView


router = routers.DefaultRouter()
router.register(r'user', ChallengesViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('upload_model/', ChallengesUploadView.as_view()),
]