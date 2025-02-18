from django.db import models
from rest_framework.exceptions import ValidationError
from django.contrib.postgres.fields import JSONField

from configuration import picture_upload_dir
from configuration.utils import ConfigKey


def config_upload_dir(instance, filename):
    return picture_upload_dir(instance, "config_images", filename)


class Configuration(models.Model):
    key = models.CharField('Key', max_length=64, unique=True)
    value = JSONField('Value', null=True, blank=True)
    description = models.TextField('Description', null=True)
    image_value = models.ImageField(
        blank=True,
        null=True,
        upload_to=config_upload_dir
    )
    is_public = models.BooleanField(default=False)
    only_admin = models.BooleanField(default=False)
    nullable = models.BooleanField(default=True)

    def __str__(self):
        return "{}: {}".format(self.key, str(self.value)[0:32])

    class Meta:
        ordering = ['key']

    @staticmethod
    def save_value(key, value):
        conf = Configuration.objects.get_or_create(key=key)
        if not conf.nullable and value is None:
            raise ValueError("Value cannot be None")
        conf.value = value
        conf.save(update_fields=['value'])
        return conf

    @staticmethod
    def get_value(key, default=None):
        conf = Configuration.objects.filter(key=key).first()
        if not conf:
            return default
        return conf.value

    @staticmethod
    def delete_value(key):
        conf = Configuration.objects.filter(key=key).first()
        if conf:
            conf.delete()

    @staticmethod
    def validate_new_value(key, value):
        from . import configs
        original = configs.__defaults__.__dict__[key]
        if isinstance(original, ConfigKey) and original.validation_function is not None:
            if callable(original.validation_function):
                if not original.validation_function(key, value):
                    raise ValidationError("Invalid value for configuration value {}".format(key))
            else:
                raise ValidationError("Invalid validation function for configuration value {}".format(key))
