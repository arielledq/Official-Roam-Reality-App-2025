from django.urls import path, include
from rest_framework.routers import DefaultRouter
from home.views import AppLogoutView

from home.api.v1.viewsets import (
    ConfirmEmailOtpViewset,
    SendEmailOtpViewset,
    SignupViewSet,
    LoginViewSet,
)

router = DefaultRouter()
router.register("signup", SignupViewSet, basename="signup")
router.register("login", LoginViewSet, basename="login")
router.register("send-email-otp", SendEmailOtpViewset, basename="send_email_otp")
router.register("confirm-email-otp", ConfirmEmailOtpViewset, basename="confirm_email_otp")

urlpatterns = [
    path("", include(router.urls)),
    path("logout/", AppLogoutView.as_view(), name="logout"),
]
