from django.urls import path, include
from rest_framework.routers import DefaultRouter
from home.views import AppLogoutView, ChangePasswordView, DeleteAccountView, ResetPasswordView

from home.api.v1.viewsets import (
    AccountSetupViewset,
    ConfirmEmailOtpViewset,
    FindFriendsAPIView,
    FriendshipViewSet,
    InviteFriendAPIview,
    SendEmailOtpViewset,
    SignupViewSet,
    LoginViewSet, ScoreViewSet,
)

router = DefaultRouter()
router.register("signup", SignupViewSet, basename="signup")
router.register("login", LoginViewSet, basename="login")
router.register("send-email-otp", SendEmailOtpViewset, basename="send_email_otp")
router.register("confirm-email-otp", ConfirmEmailOtpViewset, basename="confirm_email_otp")
router.register("account-setup", AccountSetupViewset, basename="account-setup")
router.register("scoreboard", ScoreViewSet, basename="scoreboard")
router.register("friends", FriendshipViewSet, basename="friends")

urlpatterns = [
    path("", include(router.urls)),
    path("logout/", AppLogoutView.as_view(), name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete_account"),
    # path('reset-password/send/', SendPasswordToken.as_view(), name="send_reset_password"),
    # path('reset-password/verify/', VerifyPasswordToken.as_view(), name="verify_reset_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("invite-friend/", InviteFriendAPIview.as_view(), name="invite_friend"),
    path("find-friends/", FindFriendsAPIView.as_view(), name="find-friends"),

]
