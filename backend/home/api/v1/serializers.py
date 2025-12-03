from django.contrib.auth import get_user_model
from django.http import HttpRequest
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import check_password
from allauth.account import app_settings as allauth_settings
from allauth.account.forms import ResetPasswordForm
from allauth.utils import email_address_exists, generate_unique_username
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from rest_framework import serializers
from rest_auth.serializers import PasswordResetSerializer
from modules.ar.challenges.serializers import ARMemoriesSerializer, ARUserProfileSerializer
from modules.ar.challenges.models import ARMemories
from users.models import FriendshipRequest, Notification, UserProfile
from rest_framework.authtoken.models import Token

from home.utils import EmailOTP
from home.models import Mode
from modules.ar.challenges.models import ScanPicture, GeoARStar, GeoARStarPoint
from modules.ar.challenges.serializers import SponsorSerializer, ARChallengeParameterSettingsSerializer


User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'type',)
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {
                    'input_type': 'password'
                }
            },
            'email': {
                'required': True,
                'allow_blank': False,
            }
        }

    def _get_request(self):
        request = self.context.get('request')
        if request and not isinstance(request, HttpRequest) and hasattr(request, '_request'):
            request = request._request
        return request

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                raise serializers.ValidationError(
                    _("A user is already registered with this e-mail address."))
        return email

    def create(self, validated_data):
        user = User(
            email=validated_data.get('email'),
            name=validated_data.get('name'),
            username=generate_unique_username([
                validated_data.get('name'),
                validated_data.get('email'),
                'user'
            ])
        )
        user.set_password(validated_data.get('password'))
        user.save()
        request = self._get_request()
        setup_user_email(request, user, [])
        EmailOTP.send_to_new_user(validated_data.get('email'))
        return user

    def save(self, request=None):
        """rest_auth passes request so we must override to accept it"""
        return super().save()


class UserProfileSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ('id', 'is_verified', 'image', 'account_setup', 'home_address', 'home_country','country_code', 'phone_number','gender')

    def get_image(self, obj):
        return obj.get_image_url()


class UserSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer()
    ar_user_profile_user = ARUserProfileSerializer()
    is_band_location_active = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'first_name','last_name', 'user_profile', 'ar_user_profile_user', 'type', 'geo_ar_site_band_user',
                  'is_band_location_active', 'has_receive_points',]

    def get_is_band_location_active(self, instance):
        if hasattr(instance, 'geo_ar_site_band_user'):
            return instance.geo_ar_site_band_user.is_active
        return False


class PasswordSerializer(PasswordResetSerializer):
    """Custom serializer for rest_auth to solve reset password error"""
    password_reset_form_class = ResetPasswordForm


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate(self, attrs):
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        currentpassword = self.context['request'].user.password
        matchcheck = check_password(old_password, currentpassword)

        if not matchcheck:
            raise serializers.ValidationError("Password didn't matched with existing password")
        if new_password != confirm_password:
            raise serializers.ValidationError("Password didn't matched !!")
        if self.context['request'].user.check_password(new_password):
            raise serializers.ValidationError("This password is not acceptable !!")
        return attrs


class AccountSetupSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    name = serializers.CharField(required=False)
    is_friend = serializers.SerializerMethodField()
    friends = UserSerializer(many=True, read_only=True)
    has_receive_points = serializers.BooleanField(required=False)

    # ar_memories = serializers.SerializerMethodField()

    # def get_ar_memories(self, obj):
    #     ar_memories_user = ARMemories.objects.filter(user=self.context['request'].user)
    #     return ARMemoriesSerializer(ar_memories_user, many=True).data if ar_memories_user.exists() else []

    class Meta:
        model = UserProfile
        fields = "__all__"

    def create(self, validated_data):
        user_profile = dict()
        user_profile["user"] = self.context['request'].user
        user_profile.update(validated_data)
        return UserProfile.objects.create(**user_profile)

    def update(self, instance, validated_data):
        instance.home_address = validated_data.get('home_address', instance.home_address)
        instance.home_country = validated_data.get('home_country', instance.home_country)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.country_code = validated_data.get('country_code', instance.country_code)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.account_setup = validated_data.get('account_setup', instance.account_setup)
        instance.image = validated_data.get('image', instance.image)
        instance.instagram_handle = validated_data.get('instagram_handle', instance.instagram_handle)
        instance.user.name = validated_data.get('name', instance.user.name)
        instance.user.has_receive_points = validated_data.get('has_receive_points', instance.user.has_receive_points)
        instance.user.save()
        instance.save()
        return instance
    
    def get_is_friend(self, obj):
        user = self.context['request'].user
        if obj.user in user.friends.all():
            return True
        else:
            return False


class FriendshipRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer()
    to_user = UserSerializer()

    class Meta:
        model = FriendshipRequest
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    friend_request = FriendshipRequestSerializer()
    class Meta:
        model = Notification
        fields = '__all__'


class ModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mode
        fields = ['id', 'name', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StarPointMapSerializer(serializers.ModelSerializer):
    """Serializer for star points in map view"""
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    model_file = serializers.FileField(required=False, allow_null=True)
    screen_title = serializers.SerializerMethodField()
    
    class Meta:
        model = GeoARStarPoint
        fields = [
            'id', 'title', 'screen_title', 'image', 'model_file', 
            'fun_facts', 'elevation', 'points', 'order', 
            'latitude', 'longitude'
        ]
    
    def get_latitude(self, obj):
        if obj.location:
            return obj.location.coords[1]  # lat is y coordinate
        return None
    
    def get_longitude(self, obj):
        if obj.location:
            return obj.location.coords[0]  # lng is x coordinate
        return None
    
    def get_screen_title(self, obj):
        """Ensure screen_title is always returned as a list"""
        if obj.screen_title is None:
            return []
        if isinstance(obj.screen_title, list):
            return obj.screen_title
        if isinstance(obj.screen_title, str):
            import json
            try:
                return json.loads(obj.screen_title)
            except (json.JSONDecodeError, TypeError):
                return []
        return []


class HuntMapSerializer(serializers.ModelSerializer):
    """Serializer for hunts in map view"""
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    star_points = serializers.SerializerMethodField()
    sponsor = SponsorSerializer(source='sponsors', many=True, read_only=True)
    parameters = ARChallengeParameterSettingsSerializer(source='parameter_settings', read_only=True)
    
    class Meta:
        model = GeoARStar
        fields = [
            'id', 'name', 'fun_facts', 'info', 'visibility_radius',
            'following_mode', 'attempts', 'cooldown_hours',
            'latitude', 'longitude', 'star_points', 'sponsor', 'parameters'
        ]
    
    def get_latitude(self, obj):
        if obj.geo_site and obj.geo_site.lat_long:
            return obj.geo_site.lat_long.coords[1]  # lat is y coordinate
        return None
    
    def get_longitude(self, obj):
        if obj.geo_site and obj.geo_site.lat_long:
            return obj.geo_site.lat_long.coords[0]  # lng is x coordinate
        return None
    
    def get_star_points(self, obj):
        """Get all star points for this hunt"""
        star_points = obj.stars.all().order_by('order')
        return StarPointMapSerializer(star_points, many=True, context=self.context).data


class ScanMapSerializer(serializers.ModelSerializer):
    """Serializer for scans in map view"""
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    file_image = serializers.ImageField(required=False, allow_null=True)
    file_animation_android = serializers.FileField(required=False, allow_null=True)
    file_animation_ios = serializers.FileField(required=False, allow_null=True)
    icon = serializers.ImageField(required=False, allow_null=True)
    sponsor = SponsorSerializer(required=False, allow_null=True)
    parameters = ARChallengeParameterSettingsSerializer(source='parameter_settings', read_only=True, allow_null=True)
    
    class Meta:
        model = ScanPicture
        fields = [
            'id', 'name', 'screen_title', 'file_image', 
            'icon', 'file_animation_android', 'file_animation_ios',
            'sponsor', 'info', 'attempts', 'cooldown_hours', 'points', 
            'elevation', 'latitude', 'longitude', 'parameters'
        ]
    
    def get_latitude(self, obj):
        if obj.coordinates:
            return obj.coordinates.coords[1]  # lat is y coordinate
        return None
    
    def get_longitude(self, obj):
        if obj.coordinates:
            return obj.coordinates.coords[0]  # lng is x coordinate
        return None