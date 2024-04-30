from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from ckeditor.fields import RichTextField
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.gis.db import models as gis_models

User = get_user_model()

CHALLENGE_CHOICES = (
    ("SPONSORED", "IMAGE"),
    ("DANCE", "3D MODEL"),
)

CHALLENGE_APPROVAL_CHOICES = (
    ("UNAPPROVED", "APPROVED BUT NOT REVIEWED"),
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

class GeoLocation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    image = models.ImageField(upload_to="geoar/img/", null=True, blank=True)
    geo_location = gis_models.PointField(_("Geo Location"), blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)

    class Meta:
        verbose_name_plural = "Geo Destination"
        verbose_name = "Geo Destination"

    def __str__(self):
        return self.name

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
        _("Challenge Name"), default=None, null=False, blank=False, max_length=255
    )
    sponsor = models.ForeignKey(
        Sponsor,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="sponsored",
    )
    challenge_attempt = models.IntegerField(verbose_name="Challenge Attempts", default=1)
    points = models.IntegerField(verbose_name="Challenge Points", default=0)
    challenge_requirement = models.CharField(
        max_length=50, choices=CHALLENGE_REQUIREMENT, default="PHOTO"
    )
    challenge_choice = models.CharField(verbose_name="Challenge Load From",
        max_length=50, choices=CHALLENGE_CHOICES, default="SPONSORED"
    )
    expiry_date = models.DateTimeField(blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)
    geo_location = models.ForeignKey(
        GeoLocation,
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
        related_name="geo_location_ar_challenge",
    )

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

class ARExample(models.Model):
    class Meta:
        verbose_name_plural = "AR Example"

    name = models.CharField(_("Name"), blank=True, null=True, max_length=255)
    image = models.ImageField(
        upload_to="ar/example/",
        blank=True,
        null=True,
    )
    video_file = models.FileField(upload_to="ar/example/", blank=True, null=True)
    description = RichTextField(_("Example Details"), blank=True, null=True)


class GeoArSite(models.Model):
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    image = models.ImageField(upload_to="geoar/img/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    geo_location = models.ForeignKey(
        GeoLocation,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="geo_location_ar_site",
    )
    lat_long = gis_models.PointField(_("Latitude and Longitude"), blank=True, null=True)
    geo_site_area = gis_models.MultiPolygonField(_("Geo Site Area"), blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)
    pro_tips = RichTextField(_("Pro Tips"), blank=True, null=True)
    specific_tips = RichTextField(_("Specific Tips"), blank=True, null=True)
    list_of_tips = RichTextField(_("List of Tips"), blank=True, null=True)

    class Meta:
        verbose_name_plural = "Geo AR Site"
        verbose_name = "Geo AR Site"

    def __str__(self):
        return self.name

class GeoARStar(models.Model):
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    star_location = gis_models.PointField(_("Star Location"), blank=True, null=True)
    fun_facts = RichTextField(_("Description"), blank=True, null=True)
    visibility_radius = models.IntegerField(verbose_name="Visibility Radius in Meters", default=0)
    points = models.IntegerField(verbose_name="Challenge Points", default=0)
    geo_site = models.ForeignKey(
        GeoArSite,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="geo_arstar_ar_site",
    )
    class Meta:
      verbose_name_plural = "Geo AR Star"
      verbose_name = "Geo AR Star"

    def __str__(self):
        return self.name

class GeoARSpecificSiteRoute(models.Model):
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    geo_site = models.ForeignKey(
        GeoArSite,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="geo_route_ar_site",
    )
    route = gis_models.MultiPolygonField(_("Geo Site Route"), blank=True, null=True)
    class Meta:
      verbose_name_plural = "Geo AR Specific Routes"
      verbose_name = "Geo AR Specific Routes"

    def __str__(self):
        return self.name
