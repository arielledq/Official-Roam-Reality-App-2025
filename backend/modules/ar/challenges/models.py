from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from ckeditor.fields import RichTextField
from django.contrib.auth import get_user_model

User = get_user_model()

CHALLENGE_CHOICES = (
    ("SPONSORED", "PHOTO"),
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
    sponsor = models.ForeignKey(Sponsor, on_delete=models.CASCADE, null=True,blank=True,related_name='sponsored')
    points = models.IntegerField(verbose_name='Challenge Points', default=0)
    challenge_choice = models.CharField(max_length=50,
                  choices=CHALLENGE_CHOICES,
                  default="SPONSORED")
    challenge_requirement = models.CharField(max_length=50,
                  choices=CHALLENGE_REQUIREMENT,
                  default="PHOTO")
    expiry_date = models.DateTimeField(blank=True, null=True)
    description = RichTextField(_("Description"), blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "AR Challenge"
        verbose_name = "AR Challenge"

    def __str__(self):
      return self.name
    
class Resource3dModel(models.Model):
    challenge = models.ForeignKey(Challenges, on_delete=models.CASCADE, null=True,blank=True,related_name='challenge')
    file = models.FileField(upload_to='ar/model/resources/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Resource3dModel"

    def __str__(self):
      return self.challenge.name
    
class ARUserProfile(models.Model):
    points = models.BigIntegerField(verbose_name='Challenge Points', default=0)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,related_name='user_ar_profile'
    )
    
    class Meta:
        verbose_name_plural = "User AR Profile"

    def __str__(self):
      return str(self.user.name) 
