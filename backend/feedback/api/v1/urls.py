from django.urls import path, include
from rest_framework.routers import DefaultRouter

from feedback.api.v1.viewsets import ContactUsViewSet

app_name = "agendas"

router = DefaultRouter()
router.register("contact-us", ContactUsViewSet, basename="contact_us"),

urlpatterns = [
    path("", include(router.urls)),
]
