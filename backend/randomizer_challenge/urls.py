from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import RandomizerChallengeViewSet, RandomizerTrackViewSet, ChallengeVideoViewSet

router = DefaultRouter()
router.register(r'challenges', RandomizerChallengeViewSet, basename='randomizer-challenge')
router.register(r'tracks', RandomizerTrackViewSet, basename='randomizer-track')
router.register(r'videos', ChallengeVideoViewSet, basename='challenge-video')

urlpatterns = [
    path('randomizer/', include(router.urls)),
]