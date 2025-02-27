from django.db import models
from django.utils.translation import gettext_lazy as _


class SlidePicture(models.Model):
    name = models.CharField(
        _("Name"), default=None, null=False, blank=False, max_length=255
    )
    image = models.ImageField(upload_to="slide_images/img/")
    order = models.PositiveIntegerField(
        _("Order"), default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Slide Pictures"
        verbose_name = "Slide Picture"
        ordering = ['order']

    def __str__(self):
        return self.name
