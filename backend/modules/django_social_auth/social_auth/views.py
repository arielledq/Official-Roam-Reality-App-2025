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
        except Exception as e:
            token = request.data.get("access_token")
            if not token:
                return Response({"error": "Missing access_token"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                user_data = get_facebook_user(token, settings.FACEBOOK_APP_ID)
                facebook_id = user_data["facebookUserId"]
                name = user_data.get("facebookUserName", "")

                social_account = SocialAccount.objects.filter(uid=facebook_id, provider="facebook").first()
                if social_account:
                    user = social_account.user
                else:
                    # New user
                    user = User.objects.create(username=f"fb_{facebook_id}", first_name=name)
                    user.set_unusable_password()
                    user.save()

                    # Create SocialAccount
                    SocialAccount.objects.create(user=user, uid=facebook_id, provider="facebook",
                                                 extra_data={"name": name})
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
            sponsor = Sponsor.objects.get(name='BONUS')
            geo_location = GeoLocation.objects.get(name='BONUS')
            ARMemories.objects.create(
                points=configs.POINTS_GIFT,
                sponsor=sponsor,
                geo_location=geo_location,
                memory_type='BONUS',
                user=user,
            )
            configs.NUMBER_USER_POINT_GIFT += 1
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
        user_profile = UserProfile.objects.get(user=user)
        user_profile.is_verified = True
        user_profile.save()
        serializer = UserSerializer(user)
        profileObj, created = ARUserProfile.objects.get_or_create(user=user)
        if created and configs.NUMBER_USER_POINT_GIFT < configs.LIMIT_USER_POINT_GIFT:
            profileObj.points += configs.POINTS_GIFT
            profileObj.save()
            sponsor = Sponsor.objects.get(name='BONUS')
            geo_location = GeoLocation.objects.get(name='BONUS')
            ARMemories.objects.create(
                points=configs.POINTS_GIFT,
                sponsor=sponsor,
                geo_location=geo_location,
                memory_type='BONUS',
                user=user,
            )
            configs.NUMBER_USER_POINT_GIFT += 1
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
        user_profile = UserProfile.objects.get(user=user)
        user_profile.is_verified = True
        user_profile.save()
        serializer = UserSerializer(user)
        profileObj, created = ARUserProfile.objects.get_or_create(user=user)
        if created and configs.NUMBER_USER_POINT_GIFT < configs.LIMIT_USER_POINT_GIFT:
            profileObj.points += configs.POINTS_GIFT
            profileObj.save()
            sponsor = Sponsor.objects.get(name='BONUS')
            geo_location = GeoLocation.objects.get(name='BONUS')
            ARMemories.objects.create(
                points=configs.POINTS_GIFT,
                sponsor=sponsor,
                geo_location=geo_location,
                memory_type='BONUS',
                user=user,
            )
            configs.NUMBER_USER_POINT_GIFT += 1
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