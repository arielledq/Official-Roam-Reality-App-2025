from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from home.constants import Gender
from core.utils import get_file_path
from django.utils import timezone
from home.common import CommonModel


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