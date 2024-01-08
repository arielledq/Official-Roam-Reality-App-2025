from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Challenges(models.Model):
    image = models.ImageField(upload_to='ar/img/')
    model_file = models.ImageField(upload_to='ar/model/')
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(_("Name of User"), blank=True, null=True, max_length=255)
    description = models.TextField(_("Description"), blank=True, null=True)


    def __str__(self):
        return "%s"%self.id