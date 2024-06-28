
from django.urls import path, include
from rest_framework import routers
from . import signals  # noqa
from .viewsets import ChallengesViewSet, ChallengesUploadView,\
    SponsorViewSet, ARProfileViewSet, ARMemoriesViewSet, ARSettingsViewSet, \
    ARExamplesViewSet, GeoArSiteViewSet, GeoLocationViewSet, GeoArStarViewSet, ARSitePinCheckInViewSet, StarCollectionViewSet, GoldStarCollectionViewSet

router = routers.DefaultRouter()
router.register(r'user', ChallengesViewSet)
router.register(r'ar-profile', ARProfileViewSet, basename="ar-profile")
router.register(r'sponsor', SponsorViewSet)
router.register(r'memories', ARMemoriesViewSet, basename="ar-memories")
router.register(r'check-in', ARSitePinCheckInViewSet, basename="ar-check-ins")
router.register(r'settings', ARSettingsViewSet)
router.register(r'examples', ARExamplesViewSet)
router.register(r'geo-ar-location', GeoLocationViewSet)
router.register(r'geo-ar-site', GeoArSiteViewSet)
router.register(r'geo-ar-star', GeoArStarViewSet, basename="ar-stars")
router.register(r'geo-ar-star-collect', StarCollectionViewSet, basename="ar-stars")
router.register(r'geo-ar-gold-star', GoldStarCollectionViewSet, basename="ar-gold-stars")

urlpatterns = [
    path('', include(router.urls)),
    path('upload_model/', ChallengesUploadView.as_view()),
]