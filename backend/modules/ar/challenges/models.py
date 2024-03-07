from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from ckeditor.fields import RichTextField
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

CHALLENGE_CHOICES = (
    ("SPONSORED", "IMAGE"),
    ("DANCE", "3D MODEL"),
)

CHALLENGE_APPROVAL_CHOICES = (
    ("UNAPPROVED", "UNAPPROVED"),
    ("APPROVED", "APPROVED"),
    ("DECLINED", "DECLINED"),
)

CHALLENGE_REQUIREMENT = (
    ("PHOTO", "PHOTO"),
    ("VIDEO", "VIDEO"),
    ("PHOTOVIDEO", "PHOTOVIDEO"),
)

AR_MEMORY_CHOICES = (
    ("PHOTO", "PHOTO"),
    ("VIDEO", "VIDEO"),
)

class Sponsor(models.Model):
    name = models.CharField(_("Name"), blank=True, null=True, max_length=255)
    image = models.ImageField(
        upload_to="sponsor/img/",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "AR Sponsor"

    def __str__(self):
        return self.name


class Challenges(models.Model):
    image = models.ImageField(upload_to="ar/img/", null=True, blank=True)
    model_file = models.FileField(upload_to="ar/model/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    sponsor = models.ForeignKey(
        Sponsor,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="sponsored",
    )
    challenge_attempt = models.IntegerField(verbose_name="Challenge Attempts", default=0)
    points = models.IntegerField(verbose_name="Challenge Points", default=0)
    challenge_requirement = models.CharField(
        max_length=50, choices=CHALLENGE_REQUIREMENT, default="PHOTO"
    )
    challenge_choice = models.CharField(verbose_name="Challenge Load From",
        max_length=50, choices=CHALLENGE_CHOICES, default="SPONSORED"
    )
    expiry_date = models.DateTimeField(blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)

    def save(self, *args, **kwargs):
        self.clean()
        return super(Challenges, self).save(*args, **kwargs)

    def clean(self):
        print(self.challenge_choice)
        print(self.image)
        if self.challenge_choice == "SPONSORED" and self.image == None:
            raise ValidationError("Image is mandotory, When challenge is sponsored!")
        elif self.challenge_choice == "DANCE" and self.model_file == None:
            raise ValidationError(
                "Model file is mandotory, When challenge type is Dancing!"
            )

    class Meta:
        verbose_name_plural = "Anywhere AR Challenge"
        verbose_name = "Anywhere AR Challenge"

    def __str__(self):
        return self.name


class Resource3dModel(models.Model):
    challenge = models.ForeignKey(
        Challenges,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="challenge",
    )
    file = models.FileField(upload_to="ar/model/resources/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Resource3dModel"

    def __str__(self):
        return self.challenge.name


class ARUserProfile(models.Model):
    points = models.BigIntegerField(verbose_name="Challenge Points", default=0)
    challenge_completed = models.IntegerField(verbose_name="Challenge Completed", default=0)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="user_ar_profile"
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        verbose_name_plural = "AR User Profile"

    def __str__(self):
        return str(self.user.name)


class ARMemories(models.Model):
    memory_file = models.FileField(upload_to="ar/memories/")
    thumbnail_memory_video_file = models.ImageField(upload_to="ar/memories/thumbnails/", blank=True, null=True)
    description = models.TextField(_("Description"), blank=True, null=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_ar_memories"
    )
    memory_type = models.CharField(
        max_length=50, choices=AR_MEMORY_CHOICES, default="PHOTO", blank=True, null=True
    )
    challenges = models.ForeignKey(
        Challenges,
        on_delete=models.CASCADE,
        related_name="challenges_ar_memories",
        null=True,
        blank=True,
    )
    declined_reason = models.TextField(_("Declined Reason"), blank=True, null=True)
    challenge_approval = models.CharField(
        max_length=50,
        choices=CHALLENGE_APPROVAL_CHOICES,
        default="UNAPPROVED",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        verbose_name_plural = "AR Memories"

    def clean(self):
        if self.challenge_approval == "DECLINED":
            if self.declined_reason == "":
                raise ValidationError(
                    "Declined Reason is mandotory, When challenge is declined!"
                )

    def __str__(self):
        return str(
            self.user.name + " " + str(self.memory_file)
        )

class ARSettings(models.Model):
    class Meta:
        verbose_name_plural = "AR Settings"

    waiver_details = RichTextField(_("Waiver Details"), blank=True, null=True)