# Generated manually for admin-configurable features

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


def create_default_settings(apps, schema_editor):
    """Create default BandTrackingSettings instance"""
    BandTrackingSettings = apps.get_model('band_tracking', 'BandTrackingSettings')
    BandTrackingSettings.objects.get_or_create(
        pk=1,
        defaults={
            'auto_notify_enabled': True,
            'distance_threshold_meters': 111,
            'cooldown_minutes': 15
        }
    )


class Migration(migrations.Migration):

    dependencies = [
        ('band_tracking', '0002_auto_20260210_0943'),
    ]

    operations = [
        # Create VehicleWhitelist model
        migrations.CreateModel(
            name='VehicleWhitelist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vehicle_id', models.CharField(
                    help_text='Unique identifier from third-party GPS provider (e.g., LT01)',
                    max_length=50,
                    unique=True,
                    verbose_name='Vehicle ID'
                )),
                ('is_active', models.BooleanField(
                    default=True,
                    help_text='Enable/disable this vehicle without deleting',
                    verbose_name='Active'
                )),
                ('description', models.CharField(
                    blank=True,
                    help_text="Optional description (e.g., 'Lost Tribe Truck 1 - Main Stage')",
                    max_length=200,
                    verbose_name='Description'
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('band', models.ForeignKey(
                    help_text='The band this vehicle is tracking',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='vehicles',
                    to='challenges.GeoArSite'
                )),
            ],
            options={
                'verbose_name': 'Vehicle Whitelist',
                'verbose_name_plural': 'Vehicle Whitelists',
                'ordering': ['vehicle_id'],
            },
        ),

        # Create BandTrackingSettings model
        migrations.CreateModel(
            name='BandTrackingSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('auto_notify_enabled', models.BooleanField(
                    default=True,
                    help_text='Master switch: automatically send notifications when bands move significantly',
                    verbose_name='Enable Auto-Notifications'
                )),
                ('distance_threshold_meters', models.IntegerField(
                    default=111,
                    help_text='Minimum distance (in meters) band must move to trigger notification. Default: 111m',
                    validators=[
                        django.core.validators.MinValueValidator(1),
                        django.core.validators.MaxValueValidator(10000)
                    ],
                    verbose_name='Distance Threshold (meters)'
                )),
                ('cooldown_minutes', models.IntegerField(
                    default=15,
                    help_text='Minimum time (in minutes) between notifications for the same band. Default: 15 min',
                    validators=[
                        django.core.validators.MinValueValidator(0),
                        django.core.validators.MaxValueValidator(1440)
                    ],
                    verbose_name='Cooldown Period (minutes)'
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Band Tracking Settings',
                'verbose_name_plural': 'Band Tracking Settings',
            },
        ),

        # Create BandNotificationCooldown model
        migrations.CreateModel(
            name='BandNotificationCooldown',
            fields=[
                ('band', models.OneToOneField(
                    help_text='The band this cooldown record belongs to',
                    on_delete=django.db.models.deletion.CASCADE,
                    primary_key=True,
                    related_name='notification_cooldown',
                    serialize=False,
                    to='challenges.GeoArSite'
                )),
                ('last_notification_at', models.DateTimeField(
                    help_text='When the last auto-notification was sent for this band',
                    verbose_name='Last Notification At'
                )),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_notification_message', models.ForeignKey(
                    blank=True,
                    help_text='Reference to the last notification message sent',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='cooldown_records',
                    to='band_tracking.broadcastmessage'
                )),
            ],
            options={
                'verbose_name': 'Band Notification Cooldown',
                'verbose_name_plural': 'Band Notification Cooldowns',
            },
        ),

        # Add indexes for VehicleWhitelist
        migrations.AddIndex(
            model_name='vehiclewhitelist',
            index=models.Index(fields=['vehicle_id', 'is_active'], name='band_tracki_vehicle_active_idx'),
        ),
        migrations.AddIndex(
            model_name='vehiclewhitelist',
            index=models.Index(fields=['band'], name='band_tracki_vehicle_band_idx'),
        ),

        # Create default settings instance
        migrations.RunPython(create_default_settings, reverse_code=migrations.RunPython.noop),
    ]
