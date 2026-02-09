from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    RandomizerChallengeViewSet, RandomizerTrackViewSet, ChallengeVideoViewSet,
    RandomizerSubmissionViewSet, RandomizerProfileViewSet
)

app_name = 'randomizer_challenge'

router = DefaultRouter()
router.register(r'challenges', RandomizerChallengeViewSet, basename='randomizer-challenge')
router.register(r'tracks', RandomizerTrackViewSet, basename='randomizer-track')
router.register(r'videos', ChallengeVideoViewSet, basename='challenge-video')
router.register(r'submissions', RandomizerSubmissionViewSet, basename='randomizer-submission')
router.register(r'profile', RandomizerProfileViewSet, basename='randomizer-profile')

urlpatterns = [
    # API endpoints
    path('randomizer/', include(router.urls)),

    # Note: Web fallback deep link routes are configured in travel_ar_app_42706/urls.py
    # to avoid URL conflicts and maintain proper routing hierarchy
]