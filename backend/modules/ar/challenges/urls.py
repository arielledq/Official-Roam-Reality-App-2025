
from django.urls import path, include
from rest_framework import routers
from . import signals  # noqa
from .viewsets import ChallengesViewSet, ChallengesUploadView, \
    SponsorViewSet, ARProfileViewSet, ARMemoriesViewSet, ARSettingsViewSet, \
    ARExamplesViewSet, GeoArSiteViewSet, GeoLocationViewSet, GeoArStarViewSet, ARSitePinCheckInViewSet, \
    StarCollectionViewSet, GoldStarCollectionViewSet, DestinationFactsViewSet, PanicMessageViewSet, \
    MemoryCheckinViewSet, GeoArSiteCategoryViewSet, GeoLocationMiniViewSet

router = routers.DefaultRouter()
router.register(r'user', ChallengesViewSet)
router.register(r'geo-ar-site-categories', GeoArSiteCategoryViewSet)
router.register(r'ar-profile', ARProfileViewSet, basename="ar-profile")
router.register(r'sponsor', SponsorViewSet)
router.register(r'memories', ARMemoriesViewSet, basename="ar-memories")
router.register(r'check-in', ARSitePinCheckInViewSet, basename="ar-check-ins")
router.register(r'all-memories', MemoryCheckinViewSet, basename="all-memories")
router.register(r'settings', ARSettingsViewSet)
router.register(r'examples', ARExamplesViewSet, basename="ar-example")
router.register(r'geo-ar-location', GeoLocationViewSet)
router.register(r'geo-ar-location-mini', GeoLocationMiniViewSet)
router.register(r'geo-ar-site', GeoArSiteViewSet)
router.register(r'geo-ar-star', GeoArStarViewSet, basename="ar-stars")
router.register(r'geo-ar-star-collect', StarCollectionViewSet, basename="ar-stars")
router.register(r'geo-ar-gold-star', GoldStarCollectionViewSet, basename="ar-gold-stars")
router.register(r'geo-destination-fact', DestinationFactsViewSet, basename="geo-destination-fact")
router.register(r'panic-message', PanicMessageViewSet, basename="panic-message")

urlpatterns = [
    path('', include(router.urls)),
    path('upload_model/', ChallengesUploadView.as_view()),
]