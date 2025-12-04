from rest_framework.views import APIView
import logging

from configuration import configs
from feedback.models import ReportedContent
from rest_framework.permissions import AllowAny
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.providers.apple.views import AppleOAuth2Adapter
from allauth.socialaccount.providers.apple.client import AppleOAuth2Client

from allauth.socialaccount.providers.twitter.views import TwitterOAuthAdapter
from allauth.socialaccount.models import SocialAccount, SocialToken

from rest_auth.registration.views import SocialLoginView, SocialConnectView

from notifications.models import NotificationTypes
from onesignal_client.utils import send_notification
from travel_ar_app_42706 import settings
from users.models import UserProfile, User
from .helpers import get_facebook_user
from .serializers import CustomAppleSocialLoginSerializer, CustomAppleConnectSerializer
from django.contrib.sites.shortcuts import get_current_site
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from home.api.v1.serializers import UserSerializer
from rest_auth.social_serializers import TwitterLoginSerializer
from rest_framework.exceptions import ValidationError
from allauth.utils import generate_unique_username
from rest_framework import status

from ...ar.challenges.models import ARUserProfile, Sponsor, GeoLocation, ARMemories

logger = logging.getLogger(__name__)


class ExistingAccountResponseMixin:
    """
    Provides helper methods to return a consistent response when a user tries to
    sign in with a social provider but an account with the same email already exists.
    """

    EXISTING_ACCOUNT_KEYWORDS = (
        "already registered",
        "already exists",
        "email address is already in use",
    )

    def _flatten_error_messages(self, exc):
        if isinstance(exc, ValidationError) and hasattr(exc, "detail"):
            detail = exc.detail
            messages = []

            def flatten(value):
                if isinstance(value, (list, tuple)):
                    for item in value:
                        flatten(item)
                elif isinstance(value, dict):
                    for item in value.values():
                        flatten(item)
                else:
                    messages.append(str(value))

            flatten(detail)
            if messages:
                return " ".join(messages)
        return str(exc)

    def _existing_account_response(self, provider_name, request):
        email = request.data.get("email")
        response_data = {
            "message": "An account with this email already exists.",
            "error": "ACCOUNT_EXISTS",
            "provider": provider_name,
            "details": "Please sign in using the provider you originally used or link additional providers from your profile.",
        }

        if email:
            providers = list(
                SocialAccount.objects.filter(user__email__iexact=email).values_list("provider", flat=True)
            )
            if providers:
                response_data["existing_providers"] = providers

        providers = response_data.get("existing_providers", [provider_name])
        provider_list = ", ".join(providers)

        previous_providers = provider_list or provider_name
        return Response(
            {
                "message": (
                    "User is already exist with differnet platform"
                ),
                "error": "ACCOUNT_EXISTS",
                "provider": provider_name,
                "details": "Link additional providers from your profile if needed.",
                "existing_providers": providers,
            },
            status=status.HTTP_409_CONFLICT,
        )

    def _maybe_existing_account_response(self, exc, provider_name, request):
        flattened = self._flatten_error_messages(exc).lower()
        if any(keyword in flattened for keyword in self.EXISTING_ACCOUNT_KEYWORDS):
            return self._existing_account_response(provider_name, request)
        return None

try:
    APP_DOMAIN = f"https://{get_current_site(None)}"
except Exception:
    APP_DOMAIN = ""


class FacebookLogin(ExistingAccountResponseMixin, SocialLoginView):
    permission_classes = (AllowAny,)
    adapter_class = FacebookOAuth2Adapter
    authentication_classes = []

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        logger.info(f"Facebook login request received. Data keys: {list(request.data.keys())}")
        logger.info(f"FACEBOOK_APP_ID configured: {bool(settings.FACEBOOK_APP_ID)}")
        is_limited_login_flag = request.data.get("is_limited_login", False)
        limited_login_requested = False
        if isinstance(is_limited_login_flag, bool):
            limited_login_requested = is_limited_login_flag
        elif isinstance(is_limited_login_flag, str):
            limited_login_requested = is_limited_login_flag.strip().lower() in ("1", "true", "yes", "on")
        elif isinstance(is_limited_login_flag, (int, float)):
            limited_login_requested = bool(is_limited_login_flag)
        logger.info(f"Limited Login requested: {limited_login_requested}")
        
        try:
            response = super().post(request, *args, **kwargs)
            # Check if super().post() returned an error response
            if isinstance(response, Response) and response.status_code >= 400:
                logger.warning(f"Standard Facebook login returned error response: {response.status_code}")
                # Fall through to fallback authentication
                raise Exception(f"Standard login failed with status {response.status_code}")
            
            # Check if user and token are set
            if not hasattr(self, 'user') or not hasattr(self, 'token'):
                logger.warning("Standard Facebook login succeeded but user/token not set")
                raise Exception("User or token not set after standard login")
            
            user = self.user
            token = self.token
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=["is_active"])
            
            # Get and save username from Facebook for standard flow
            try:
                social_account = SocialAccount.objects.get(user=user, provider='facebook')
                extra_data = social_account.extra_data
                # Extract name information from Facebook's extra_data
                first_name = extra_data.get('first_name', '')
                last_name = extra_data.get('last_name', '')
                name = extra_data.get('name', '')
                # Update user's first_name and last_name if not already set
                if not user.first_name and first_name:
                    user.first_name = first_name
                if not user.last_name and last_name:
                    user.last_name = last_name
                # Set full name as first_name if individual names not available
                if not user.first_name and not user.last_name and name:
                    name_parts = name.split(' ', 1)
                    user.first_name = name_parts[0]
                    if len(name_parts) > 1:
                        user.last_name = name_parts[1]
                user.save()
            except SocialAccount.DoesNotExist:
                pass
                
        except Exception as e:
            error_message = str(e)
            suppress_stacktrace = False

            if isinstance(e, ValidationError):
                # Flatten error details to string for easier inspection/logging.
                validation_detail = e.detail if hasattr(e, "detail") else {}
                if isinstance(validation_detail, dict):
                    combined_messages = []
                    for val in validation_detail.values():
                        if isinstance(val, list):
                            combined_messages.extend([str(v) for v in val])
                        else:
                            combined_messages.append(str(val))
                    error_message = " ".join(combined_messages) or error_message
                else:
                    error_message = str(validation_detail)

                if "already registered" in error_message.lower():
                    suppress_stacktrace = True
                    logger.info("Standard Facebook login reported existing email; switching to fallback flow.")

            if limited_login_requested and not isinstance(e, ValidationError):
                logger.info("Skipping standard Facebook flow due to limited login token.")
            elif not suppress_stacktrace:
                logger.warning(f"Standard Facebook login flow failed: {error_message}", exc_info=True)
            else:
                logger.info(f"Standard Facebook login flow failed: {error_message}")
            token = request.data.get("access_token")
            if not token:
                logger.error("Missing access_token in request")
                return Response({"message": "Missing access_token", "error": "MISSING_TOKEN"}, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Attempting fallback Facebook authentication with token (length: {len(token) if token else 0})")
            try:
                user_data = get_facebook_user(token, settings.FACEBOOK_APP_ID, prefer_limited=limited_login_requested)
                facebook_id = user_data["facebookUserId"]
                first_name = user_data.get("facebookFirstName", "")
                last_name = user_data.get("facebookLastName", "")
                name = user_data.get("facebookUserName", "")
                email = user_data.get("facebookUserEmail", "")
                
                logger.info(f"Successfully retrieved Facebook user data. Facebook ID: {facebook_id}")

                social_account = SocialAccount.objects.filter(uid=facebook_id, provider="facebook").first()
                if social_account:
                    user = social_account.user
                    logger.info(f"Found existing user: {user.id}")
                else:
                    # Try to find an existing user by email before creating a new one.
                    user = None
                    if email:
                        user = User.objects.filter(email__iexact=email).first()
                        if user:
                            logger.info(f"Linking existing user {user.id} to Facebook account via email match.")

                    if not user:
                        logger.info("Creating new user from Facebook login")
                        if not first_name and not last_name and name:
                            name_parts = name.split(' ', 1)
                            first_name = name_parts[0]
                            last_name = name_parts[1] if len(name_parts) > 1 else ""

                        base_username = email.split('@')[0] if email else facebook_id
                        username = generate_unique_username([base_username, facebook_id, "facebook"])

                        user = User.objects.create(
                            username=username,
                            first_name=first_name,
                            last_name=last_name,
                            email=email
                        )
                        user.set_unusable_password()
                        user.save()

                    # Create SocialAccount entry for either existing or newly created user.
                    SocialAccount.objects.create(
                        user=user,
                        uid=facebook_id,
                        provider="facebook",
                        extra_data={
                            "name": name,
                            "first_name": first_name,
                            "last_name": last_name
                        }
                    )

                # Update missing name fields for the linked user.
                if not user.is_active:
                    user.is_active = True
                if not user.first_name and first_name:
                    user.first_name = first_name
                if not user.last_name and last_name:
                    user.last_name = last_name
                if not user.first_name and not user.last_name and name:
                    name_parts = name.split(' ', 1)
                    user.first_name = name_parts[0]
                    if len(name_parts) > 1:
                        user.last_name = name_parts[1]
                user.save()
                # Generate token
                token, _ = Token.objects.get_or_create(user=user)
            except Exception as ex:
                error_message = str(ex)
                logger.error(f"Facebook authentication failed: {error_message}", exc_info=True)
                
                error_lower = error_message.lower()
                
                # Check for specific error types
                if "bad signature" in error_lower:
                    return Response({
                        "message": error_message,
                        "error": "INVALID_TOKEN",
                        "details": "The Facebook access token has a bad signature. The token may be corrupted, expired, or invalid. Please request a new token from Facebook."
                    }, status=status.HTTP_401_UNAUTHORIZED)
                elif "audience" in error_lower or "doesn't match" in error_lower:
                    return Response({
                        "message": error_message,
                        "error": "AUDIENCE_MISMATCH",
                        "details": f"The Facebook access token was issued for a different App ID. Expected App ID: {settings.FACEBOOK_APP_ID or 'NOT CONFIGURED'}. Please ensure the token matches your configured FACEBOOK_APP_ID."
                    }, status=status.HTTP_401_UNAUTHORIZED)
                elif "expired" in error_lower:
                    return Response({
                        "message": error_message,
                        "error": "TOKEN_EXPIRED",
                        "details": "The Facebook access token has expired. Please request a new token from Facebook."
                    }, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({
                        "message": error_message,
                        "error": "AUTHENTICATION_FAILED",
                        "details": "Facebook authentication failed. Please check your access token and try again."
                    }, status=status.HTTP_401_UNAUTHORIZED)

        if ReportedContent.objects.filter(reported_user=user, block_reported_user=True).exists():
            return Response({"message": "Your account has been blocked."}, status=status.HTTP_400_BAD_REQUEST)

        user_profile, _ = UserProfile.objects.get_or_create(user=user)
        user_profile.is_verified = True
        user_profile.save()

        profileObj, created = ARUserProfile.objects.get_or_create(user=user)
        if created and configs.NUMBER_USER_POINT_GIFT < configs.LIMIT_USER_POINT_GIFT:
            profileObj.points += configs.POINTS_GIFT
            profileObj.save()
            # sponsor = Sponsor.objects.get(name='BONUS')
            # geo_location = GeoLocation.objects.get(name='BONUS')
            # ARMemories.objects.create(
            #     points=configs.POINTS_GIFT,
            #     sponsor=sponsor,
            #     geo_location=geo_location,
            #     memory_type='BONUS',
            #     user=user,
            # )
            # configs.NUMBER_USER_POINT_GIFT += 1
            send_notification(
                NotificationTypes.DEFAULT,
                user,
                title="🎁 Surprise!",
                description=f'We’ve added {configs.POINTS_GIFT} bonus points to your Roam Reality account—just for being one of the first {configs.LIMIT_USER_POINT_GIFT} roamers to download the app!',
            )

        serializer = UserSerializer(user)
        return Response({'token': token.key, 'user': serializer.data})
    

class GoogleLogin(ExistingAccountResponseMixin, SocialLoginView): 
    '''Login api using to create new account and login'''
    permission_classes = (AllowAny,) 
    adapter_class = GoogleOAuth2Adapter 
    client_class = OAuth2Client
    authentication_classes = []

    def get_serializer(self, *args, **kwargs): 
        serializer_class = self.get_serializer_class() 
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except ValidationError as exc:
            existing_response = self._maybe_existing_account_response(exc, "google", request)
            if existing_response:
                return existing_response
            raise

    def get_response(self):
        token = self.token
        user = self.user
        if ReportedContent.objects.filter(reported_user=user,block_reported_user=True).exists():
            return Response({"message": "Your account has been blocked."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get and save username from Google
        try:
            social_account = SocialAccount.objects.get(user=user, provider='google')
            extra_data = social_account.extra_data
            # Extract name information from Google's extra_data
            given_name = extra_data.get('given_name', '')
            family_name = extra_data.get('family_name', '')
            full_name = extra_data.get('name', '')
            # Update user's first_name and last_name if not already set
            if not user.first_name and given_name:
                user.first_name = given_name
            if not user.last_name and family_name:
                user.last_name = family_name
            # Set full name as first_name if individual names not available
            if not user.first_name and not user.last_name and full_name:
                user.first_name = full_name
            user.save()
        except SocialAccount.DoesNotExist:
            pass
        
        user_profile = UserProfile.objects.get(user=user)
        user_profile.is_verified = True
        user_profile.save()
        serializer = UserSerializer(user)
        profileObj, created = ARUserProfile.objects.get_or_create(user=user)
        if created and configs.NUMBER_USER_POINT_GIFT < configs.LIMIT_USER_POINT_GIFT:
            profileObj.points += configs.POINTS_GIFT
            profileObj.save()
            # sponsor = Sponsor.objects.get(name='BONUS')
            # geo_location = GeoLocation.objects.get(name='BONUS')
            # ARMemories.objects.create(
            #     points=configs.POINTS_GIFT,
            #     sponsor=sponsor,
            #     geo_location=geo_location,
            #     memory_type='BONUS',
            #     user=user,
            # )
            # configs.NUMBER_USER_POINT_GIFT += 1
            send_notification(
                NotificationTypes.DEFAULT,
                user,
                title="\U0001F381 Surprise!",
                description=f'We’ve added {configs.POINTS_GIFT} bonus points to your Roam Reality account—just for '
                            f'being one of the first {configs.LIMIT_USER_POINT_GIFT} roamers to download the app!',
            )
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_200_OK)



class AppleLogin(ExistingAccountResponseMixin, SocialLoginView):
    adapter_class = AppleOAuth2Adapter
    client_class = AppleOAuth2Client
    serializer_class = CustomAppleSocialLoginSerializer
    callback_url = f"https://{APP_DOMAIN}/accounts/apple/login/callback/"
    authentication_classes = []
    
    def get_serializer(self, *args, **kwargs): 
        serializer_class = self.get_serializer_class() 
        kwargs['context'] = self.get_serializer_context() 
        return serializer_class(*args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except ValidationError as exc:
            existing_response = self._maybe_existing_account_response(exc, "apple", request)
            if existing_response:
                return existing_response
            raise

    def get_response(self):
        token = self.token
        user = self.user
        if ReportedContent.objects.filter(reported_user=user,block_reported_user=True).exists():
            return Response({"message": "Your account has been blocked."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get and save username from Apple (if provided in request)
        # Apple only sends name on first authentication, so we save it if available
        first_name = self.request.data.get('first_name')
        last_name = self.request.data.get('last_name')
        
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if first_name or last_name:
            user.save()
        
        user_profile = UserProfile.objects.get(user=user)
        user_profile.is_verified = True
        user_profile.save()
        serializer = UserSerializer(user)
        profileObj, created = ARUserProfile.objects.get_or_create(user=user)
        if created and configs.NUMBER_USER_POINT_GIFT < configs.LIMIT_USER_POINT_GIFT:
            profileObj.points += configs.POINTS_GIFT
            profileObj.save()
            # sponsor = Sponsor.objects.get(name='BONUS')
            # geo_location = GeoLocation.objects.get(name='BONUS')
            # ARMemories.objects.create(
            #     points=configs.POINTS_GIFT,
            #     sponsor=sponsor,
            #     geo_location=geo_location,
            #     memory_type='BONUS',
            #     user=user,
            # )
            # configs.NUMBER_USER_POINT_GIFT += 1
            send_notification(
                NotificationTypes.DEFAULT,
                user,
                title="\U0001F381 Surprise!",
                description=f'We’ve added {configs.POINTS_GIFT} bonus points to your Roam Reality account—just for '
                            f'being one of the first {configs.LIMIT_USER_POINT_GIFT} roamers to download the app!',
            )
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_200_OK)


class FacebookConnect(SocialConnectView):
    permission_classes = (AllowAny,)
    adapter_class = FacebookOAuth2Adapter

    def get_serializer(self, *args, **kwargs): 
        serializer_class = self.get_serializer_class() 
        kwargs['context'] = self.get_serializer_context() 
        return serializer_class(*args, **kwargs)


class GoogleConnect(SocialConnectView):
    '''Connect api using to login for already existing account '''
    permission_classes = (AllowAny,)
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client


class AppleConnect(SocialConnectView):
    adapter_class = AppleOAuth2Adapter
    client_class = AppleOAuth2Client
    serializer_class = CustomAppleConnectSerializer



class TwitterLogin(SocialLoginView):
    permission_classes = (AllowAny,)
    serializer_class = TwitterLoginSerializer
    adapter_class = TwitterOAuthAdapter

    def get_serializer(self, *args, **kwargs): 
        serializer_class = self.get_serializer_class() 
        kwargs['context'] = self.get_serializer_context() 
        return serializer_class(*args, **kwargs)
    
    def get_response(self):
        token = self.token
        user = self.user
        serializer = UserSerializer(user)
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_200_OK)