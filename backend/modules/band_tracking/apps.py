"""
App configuration for Band Tracking.
"""
from django.apps import AppConfig


class BandTrackingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.band_tracking'
    verbose_name = 'Band Tracking'
