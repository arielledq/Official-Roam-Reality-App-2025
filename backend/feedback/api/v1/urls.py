from django.urls import path, include
from rest_framework.routers import DefaultRouter

from feedback.api.v1.viewsets import *

app_name = "feedback"

router = DefaultRouter()
router.register("contact-us", ContactUsViewSet, basename="contact_us"),
router.register("report-content", ReportedContentViewSet, basename="report_content"),

urlpatterns = [
    path("", include(router.urls)),
]
