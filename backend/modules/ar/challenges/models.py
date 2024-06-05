from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from ckeditor.fields import RichTextField
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.gis.db import models as gis_models
from taggit.managers import TaggableManager
from django.core.validators import MaxValueValidator, MinValueValidator

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

GRADIENT_DIRECTION = (
    ("TOP_TO_BOTTOM", "TOP TO BOTTOM"),
    ("BOTTOM_TO_TOP", "BOTTOM TO TOP")
)

LOCATION_OPTION = (
    ("COUNTRY_ONLY", "COUNTRY ONLY"),
    ("SITE_COUNTRY", "SITE + COUNTRY")
)

GEO_CHALLENGE_CHOICES = (
    ("IMAGE", "IMAGE"),
    ("3DMODEL", "3D MODEL"),
)

class GeoRegion(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    latitude_longitude = gis_models.PointField(_("Geo Location"), blank=True, null=True)
    map_longitude_delta = models.DecimalField(_("Map Initial Longitude Delta"),decimal_places=4,max_digits=6, default=1)
    map_latitude_delta = models.DecimalField(_("Map Initial Longitude Delta"),decimal_places=4,max_digits=6, default=0.0922)
    
    class Meta:
        verbose_name_plural = "Geo Regions"
        verbose_name = "Geo Region"

    def __str__(self):
        return self.name

class GeoLocation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    image = models.ImageField(upload_to="geoar/img/", null=True, blank=True)
    geo_location = gis_models.PointField(_("Geo Location"), blank=True, null=True)
    regions = models.ManyToManyField(GeoRegion,verbose_name="AR Regions",related_name="geo_location_region", blank=True, null=True, default=None)
    sequence_number = models.IntegerField(verbose_name="Sequence Number", default=0)
    map_longitude_delta = models.DecimalField(_("Map Initial Longitude Delta"),decimal_places=4,max_digits=6, default=1)
    map_latitude_delta = models.DecimalField(_("Map Initial Longitude Delta"),decimal_places=4,max_digits=6, default=0.0922)

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

class ARChallengeParameterSettings(models.Model):
    name = models.CharField(
        _("Settings Name"), default=None, null=False, blank=False, max_length=255
    )
    loop_animations = models.BooleanField(_("Loop Animation"), default=False)
    loop_delay = models.IntegerField(_("Loop Delay"),validators=[MinValueValidator(0)], default=1000, null=False, blank=False)
    pinch_to_zoom = models.BooleanField(_("Pinch to Zoom"), default=False)
    min_pinch_scale = models.DecimalField(_("Minimum Zoom Scaling"),validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('1.00'))], max_digits = 3, decimal_places=2, default=0.02)
    rotation = models.BooleanField(_("Rotation"), default=False)
    bloom = models.BooleanField(_("Bloom"), default=False)
    sound_play_and_pause = models.BooleanField(_("Sound Play and Pause"), default=False)
    image_opacity = models.BooleanField(_("Image Opacity"), default=False)
    image_opacity_value = models.DecimalField(_("Image Opacity Value"),validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('1.00'))], max_digits = 3, decimal_places=2, default=1.00)
    tracking_and_anchors = models.BooleanField(_("Tracking and Anchors"), default=False)
    scale_object = models.DecimalField(_("Object Scale"),validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('1.00'))], max_digits = 3, decimal_places=2, default=0.05)
    positionX = models.IntegerField(_("Position X"), default=0, null=False, blank=False)
    positionY = models.IntegerField(_("Position Y"), default=0, null=False, blank=False)
    positionZ = models.IntegerField(_("Position Z"), default=-25, null=False, blank=False)
    ar_portals = models.BooleanField(_("AR Portals"), default=False)
    image_recognition = models.BooleanField(_("Image Recognition"), default=False)
    image_recognition_file = models.FileField(
        _("Image Recognition File"),
        upload_to="ar_ir/img/",
        blank=True,
        null=True,
    )

    class Meta:
      verbose_name_plural = "AR Challenge Parameter Settings"
      verbose_name = "AR Challenge Parameter Settings"

    def __str__(self):
        return self.name

class ARChallengeFilters(models.Model):
    name = models.CharField(
        _("Filter Name"), default=None, null=False, blank=False, max_length=255
    )
    image = models.ImageField(_("Filter Image"),upload_to="filters/img/", null=True, blank=True)
    gradient_colors = TaggableManager(verbose_name="Gradient Colours", blank=False)
    gradient_direction = models.CharField(
        max_length=50, choices=GRADIENT_DIRECTION, default="TOP_TO_BOTTOM", blank=False, null=False
    )
    filter_text = models.CharField(_("Filter Text"), max_length=200, blank=False, null=False,default='')
    filter_text_color = models.CharField(_("Filter Text Color"), max_length=10, blank=False, null=False,default='#ffffff')
    filter_text_size = models.CharField(_("Filter Text Size"), max_length=10, blank=False, null=False,default='22')
    location_option = models.CharField(_("Location Text"),
        max_length=50, choices=LOCATION_OPTION, default="COUNTRY_ONLY", blank=False, null=False
    )
    location_text_size = models.CharField(_("Location Text Size"), max_length=10, blank=False, null=False,default='18')
    location_text_color = models.CharField(_("Location Text Color"), max_length=10, blank=False, null=False,default='#ffffff')

    class Meta:
        verbose_name_plural = "AR Filters"
        verbose_name = "AR Filter"

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
    ar_filters = models.ManyToManyField(ARChallengeFilters,verbose_name="AR Filters",related_name="filter_ar_challenge", blank=True, null=True, default=None)
    parameter_settings = models.ForeignKey(
        ARChallengeParameterSettings,
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
        related_name="geo_parameters_ar_challenge",
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

class GeoARChallenges(models.Model):
    name = models.CharField(
        _("Challenge Name"), default=None, null=False, blank=False, max_length=255
    )
    image = models.ImageField(upload_to="ar/img/", null=True, blank=True)
    model_file = models.FileField(upload_to="ar/model/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sponsor = models.ForeignKey(
        Sponsor,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="sponsors_geo_ar",
    )
    challenge_attempt = models.IntegerField(verbose_name="Challenge Attempts", default=1)
    points = models.IntegerField(verbose_name="Challenge Points", default=0)
    challenge_requirement = models.CharField(
        max_length=50, choices=CHALLENGE_REQUIREMENT, default="PHOTO"
    )
    challenge_choice = models.CharField(verbose_name="Challenge Load From",
        max_length=50, choices=GEO_CHALLENGE_CHOICES, default="3DMODEL"
    )
    parameter_settings = models.ForeignKey(
        ARChallengeParameterSettings,
        on_delete=models.CASCADE,
        default=None,
        null=True,
        blank=True,
        related_name="parameter_settings_geo_ar_challenge",
    )
    expiry_date = models.DateTimeField(blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)

    def save(self, *args, **kwargs):
        self.clean()
        return super(GeoARChallenges, self).save(*args, **kwargs)

    def clean(self):
        print(self.challenge_choice)
        print(self.image)
        if self.challenge_choice == "IMAGE" and self.image == None:
            raise ValidationError("Image is mandotory, When challenge is sponsored!")
        elif self.challenge_choice == "3DMODEL" and self.model_file == None:
            raise ValidationError(
                "Model file is mandotory, When challenge type is Dancing!"
            )

    class Meta:
        verbose_name_plural = "Geo AR Challenges"
        verbose_name = "Geo AR Challenge"

    def __str__(self):
        return self.name

class ARUserProfile(models.Model):
    points = models.BigIntegerField(verbose_name="Challenge Points", default=0)
    check_ins = models.BigIntegerField(verbose_name="Check-ins", default=0)
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
        verbose_name_plural = "AR Settings and Legal"
        verbose_name = "AR Settings and Legal"

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
    pin_challenge = models.ForeignKey(GeoARChallenges,
       verbose_name="Geo Pin Challenge Name",
        on_delete=models.SET_DEFAULT,
        related_name="challenge_geo_ar_pin_site",
        blank=True, null=True, default=None
    )
    lat_long = gis_models.PointField(_("Latitude and Longitude"), blank=True, null=True)
    geo_site_area = gis_models.MultiPolygonField(_("Geo Site Area"), blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)
    pro_tips = RichTextField(_("Pro Tips"), blank=True, null=True)
    check_ins = models.IntegerField(verbose_name="Check-ins", default=0)
    check_ins_radius = models.IntegerField(verbose_name="Check-ins Radius in Meters", default=50)

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
    geo_site = models.ForeignKey(
        GeoArSite,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="geo_arstar_ar_site",
    )
    challenges = models.ForeignKey(GeoARChallenges,
       verbose_name="Geo Challenge Name",
        on_delete=models.SET_DEFAULT,
        related_name="challenges_geo_ar_star_site",
        blank=False, null=False, default=None
    )
    class Meta:
      verbose_name_plural = "Geo AR Stars"
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

class UniqueChallengeSite(models.Model):
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    geo_location = models.ForeignKey(
        GeoLocation,
        on_delete=models.CASCADE,
        default=None,
        null=False,
        blank=False,
        related_name="geo_location_ar_unique_site",
    )
    challenge = models.ManyToManyField(GeoARChallenges,
        verbose_name="Geo Challenge Name",
        related_name="challenges_geo_ar_unique_site",
        blank=False, null=False, default=None
    )

    class Meta:
      verbose_name_plural = "Geo AR Unique Sites"
      verbose_name = "Geo AR Unique Site"

    def __str__(self):
        return self.name