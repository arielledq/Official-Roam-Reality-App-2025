from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import UserAgreementViewSet

router = DefaultRouter()
# because we are using a custom queryset for our viewset, the basename
# must be specified explicitly here. See: https://www.django-rest-framework.org/api-guide/routers/#Usage
# Your policy will be available at : /modules/privacy-policy/
router.register("", UserAgreementViewSet, basename="user-agreement")

urlpatterns = [
    path("", include(router.urls)),
]
