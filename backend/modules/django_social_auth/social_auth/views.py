from rest_framework.views import APIView

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
from rest_framework import status

from ...ar.challenges.models import ARUserProfile, Sponsor, GeoLocation, ARMemories

try:
    APP_DOMAIN = f"https://{get_current_site(None)}"
except Exception:
    APP_DOMAIN = ""


class FacebookLogin(SocialLoginView):
    permission_classes = (AllowAny,)
    adapter_class = FacebookOAuth2Adapter
    authentication_classes = []

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            super().post(request, *args, **kwargs)
            user = self.user
            token = self.token
            
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
            token = request.data.get("access_token")
            if not token:
                return Response({"error": "Missing access_token"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                user_data = get_facebook_user(token, settings.FACEBOOK_APP_ID)
                facebook_id = user_data["facebookUserId"]
                first_name = user_data.get("facebookFirstName", "")
                last_name = user_data.get("facebookLastName", "")
                name = user_data.get("facebookUserName", "")
                email = user_data.get("facebookUserEmail", "")

                social_account = SocialAccount.objects.filter(uid=facebook_id, provider="facebook").first()
                if social_account:
                    user = social_account.user
                    # Update existing user's name if not set
                    if not user.first_name and first_name:
                        user.first_name = first_name
                    if not user.last_name and last_name:
                        user.last_name = last_name
                    # Fallback to splitting full name
                    if not user.first_name and not user.last_name and name:
                        name_parts = name.split(' ', 1)
                        user.first_name = name_parts[0]
                        if len(name_parts) > 1:
                            user.last_name = name_parts[1]
                    user.save()
                else:
                    # New user
                    if not first_name and not last_name and name:
                        # Split full name if individual names not provided
                        name_parts = name.split(' ', 1)
                        first_name = name_parts[0]
                        last_name = name_parts[1] if len(name_parts) > 1 else ""
                    
                    user = User.objects.create(
                        username=email.split('@')[0] if email else facebook_id,
                        first_name=first_name,
                        last_name=last_name,
                        email=email
                    )
                    user.set_unusable_password()
                    user.save()

                    # Create SocialAccount
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
                # Generate token
                token, _ = Token.objects.get_or_create(user=user)
            except Exception as ex:
                return Response({"error": str(ex)}, status=status.HTTP_401_UNAUTHORIZED)

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
    

class GoogleLogin(SocialLoginView): 
    '''Login api using to create new account and login'''
    permission_classes = (AllowAny,) 
    adapter_class = GoogleOAuth2Adapter 
    client_class = OAuth2Client
    authentication_classes = []

    def get_serializer(self, *args, **kwargs): 
        serializer_class = self.get_serializer_class() 
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

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



class AppleLogin(SocialLoginView):
    adapter_class = AppleOAuth2Adapter
    client_class = AppleOAuth2Client
    serializer_class = CustomAppleSocialLoginSerializer
    callback_url = f"https://{APP_DOMAIN}/accounts/apple/login/callback/"
    authentication_classes = []
    
    def get_serializer(self, *args, **kwargs): 
        serializer_class = self.get_serializer_class() 
        kwargs['context'] = self.get_serializer_context() 
        return serializer_class(*args, **kwargs)
    
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