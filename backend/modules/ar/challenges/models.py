from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

CHALLENGE_CHOICES = (
    ("SPONSORED", "SPONSORED"),
    ("DANCE", "DANCE"),
)

CHALLENGE_REQUIREMENT = (
    ("PHOTO", "PHOTO"),
    ("VIDEO", "VIDEO"),
    ("PHOTOVIDEO", "PHOTOVIDEO"),
)

class Sponsor(models.Model):
    name = models.CharField(_("Name"), blank=True, null=True, max_length=255)
    image = models.ImageField(upload_to='sponsor/img/', blank=True, null=True,)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Sponsor"

    def __str__(self):
      return self.name

class Challenges(models.Model):
    image = models.ImageField(upload_to='ar/img/')
    model_file = models.FileField(upload_to='ar/model/')
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(_("Name"), blank=True, null=True, max_length=255)
    description = models.TextField(_("Description"), blank=True, null=True)
    sponsor = models.ForeignKey(Sponsor, on_delete=models.CASCADE, null=True,blank=True,related_name='sponsored')
    points = models.IntegerField(verbose_name='Challenge Points', default=0)
    challenge_choice = models.CharField(max_length=50,
                  choices=CHALLENGE_CHOICES,
                  default="SPONSORED")
    challenge_requirement = models.CharField(max_length=50,
                  choices=CHALLENGE_REQUIREMENT,
                  default="PHOTO")
    expiry_date = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Challenges"
        verbose_name = "Challenge"

    def __str__(self):
      return self.name