from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from configuration import configs
from home.constants import Gender
from core.utils import get_file_path
from django.utils import timezone
from home.common import CommonModel
import base64
import os


def get_placeholder_image_base64():
    """Get the placeholder image as base64 data URL"""
    try:
        # Path to the placeholder image in static folder
        static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'img')
        placeholder_path = os.path.join(static_dir, 'profile_placeholder.png')
        
        if os.path.exists(placeholder_path):
            with open(placeholder_path, 'rb') as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                return f'data:image/png;base64,{encoded_string}'
    except Exception:
        pass
    
    # Fallback to a simple SVG if PNG is not available
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2ZpbGUgSW1hZ2U8L3RleHQ+PC9zdmc+'


class User(AbstractUser):
    # WARNING!
    """
    Some officially supported features of Crowdbotics Dashboard depend on the initial
    state of this User model (Such as the creation of superusers using the CLI
    or password reset in the dashboard). Changing, extending, or modifying this model
    may lead to unexpected bugs and or behaviors in the automated flows provided
    by Crowdbotics. Change it at your own risk.


    This model represents the User instance of the system, login system and
    everything that relates with an `User` is represented by this model.
    """

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = models.CharField(_("Name of User"), blank=True, null=True, max_length=255)

    class UserType:
        REGULAR = 1
        BAND = 2
        choices = (
            (1, 'REGULAR'),
            (2, 'BAND'),
        )

    type = models.IntegerField(
        choices=UserType.choices,
        default=UserType.REGULAR
    )

    has_receive_points = models.BooleanField(default=False)

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})
    
    def __str__(self):
        return self.email
    
    
class UserProfile(CommonModel):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,related_name='user_profile'
    )
    is_verified = models.BooleanField(
        default=False
    )
    image = models.ImageField(
        upload_to=get_file_path,
        null=True, blank=True
    )
    gender = models.PositiveSmallIntegerField(choices=Gender.GENDER_CHOICES, blank=True, null=True)
    home_address = models.CharField(max_length=255, blank=True, null=True)
    home_country = models.CharField(max_length=255, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    country_code = models.CharField(max_length=5, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    account_setup = models.BooleanField(default=False)
    friends = models.ManyToManyField(User, related_name='friends')

    def get_image_url(self):
        """Return the image URL or placeholder if no image is set"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        
        # Return the exact PNG placeholder image as a base64 data URL
        # return get_placeholder_image_base64()
        return configs.DEFAULT_IMAGE.get("image_url")

    def __str__(self):
        return self.user.email


class UserOtp(CommonModel):
    email = models.EmailField(_('email address'))
    otp = models.CharField(max_length=4)

    def __str__(self) -> str:
        return str(self.email)


class EmailTokenVerification(CommonModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=50)

    def __str__(self) -> str:
        return self.user.email

class PasswordReset(EmailTokenVerification):
    pass


class FriendshipRequest(models.Model):
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendship_requests_sent",
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendship_requests_received",
    )
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = _("Friendship Request")
        verbose_name_plural = _("Friendship Requests")

    def __str__(self):
        return "%s" % self.from_user_id
    
# @receiver(post_save, sender=FriendshipRequest)
# def new_friend_request_received(sender, instance, created, **kwargs):
#     if created:
#         Notification.objects.create(
#             sender=instance.from_user,
#             receiver=instance.to_user,
#             title="Friend Request",
#             message=f"{instance.from_user.name} sent you a friend request",
#             notification_type=Notification.FRIEND_REQUEST,
#             friend_request=instance
#         )
    

class Notification(CommonModel):
    FRIEND_REQUEST = 'friend_request'
    OTHER = 'other'
    NOTIFICATION_TYPE_CHOICES = (
        (FRIEND_REQUEST, 'Friend Request'),
        (OTHER, 'Other'),
    )

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender_notification", null=True, blank=True)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiver_notification", null=True, blank=True)
    title = models.CharField(max_length=200,null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    notification_type = models.CharField(choices=NOTIFICATION_TYPE_CHOICES, max_length=20, null=True, blank=True, default=OTHER)
    friend_request = models.ForeignKey(FriendshipRequest, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)

    def __str__(self):
        return str(self.sender)
