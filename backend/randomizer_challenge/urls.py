from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import RandomizerChallengeViewSet, RandomizerTrackViewSet

router = DefaultRouter()
router.register(r'challenges', RandomizerChallengeViewSet, basename='randomizer-challenge')
router.register(r'tracks', RandomizerTrackViewSet, basename='randomizer-track')

urlpatterns = [
    path('randomizer/', include(router.urls)),
]