# Generated migration for band_tracking app

from django.conf import settings
import django.contrib.gis.db.models.fields
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('challenges', '0131_geoarsite_band_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='BroadcastMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Message title shown in push notification', max_length=255, verbose_name='Title')),
                ('content', models.TextField(help_text='Message body', verbose_name='Content')),
                ('sent_at', models.DateTimeField(blank=True, help_text='When the message was broadcast. Null if not sent yet.', null=True, verbose_name='Sent At')),
                ('recipients_count', models.IntegerField(default=0, help_text='Number of users who received this message', validators=[django.core.validators.MinValueValidator(0)], verbose_name='Recipients Count')),
                ('is_deleted', models.BooleanField(default=False, help_text='Soft delete flag', verbose_name='Deleted')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, help_text='Admin who created the message. Null for system-generated messages.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='broadcast_messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Broadcast Message',
                'verbose_name_plural': 'Broadcast Messages',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='NotificationHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('delivered', models.BooleanField(default=False, help_text='Whether push notification was successfully delivered', verbose_name='Delivered')),
                ('read', models.BooleanField(default=False, help_text='Whether user has read the message', verbose_name='Read')),
                ('delivered_at', models.DateTimeField(blank=True, null=True, verbose_name='Delivered At')),
                ('read_at', models.DateTimeField(blank=True, null=True, verbose_name='Read At')),
                ('notification_id', models.CharField(blank=True, help_text='OneSignal notification ID for tracking', max_length=255, null=True, verbose_name='Notification ID')),
                ('error_message', models.TextField(blank=True, help_text='Error message if delivery failed', null=True, verbose_name='Error Message')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notification_histories', to='band_tracking.BroadcastMessage')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notification_histories', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Notification History',
                'verbose_name_plural': 'Notification Histories',
                'ordering': ['-created_at'],
                'unique_together': {('message', 'user')},
            },
        ),
        migrations.CreateModel(
            name='BandLocation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('location', django.contrib.gis.db.models.fields.PointField(help_text='Parsed GPS coordinates (Point with lat/lng)', srid=4326, verbose_name='Location')),
                ('gps_string', models.TextField(help_text='Raw GPS string received from third party', verbose_name='GPS String')),
                ('accuracy', models.FloatField(blank=True, help_text='GPS accuracy in meters (if available)', null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Accuracy')),
                ('altitude', models.FloatField(blank=True, help_text='Altitude in meters (if available)', null=True, verbose_name='Altitude')),
                ('speed', models.FloatField(blank=True, help_text='Speed in km/h (if available)', null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Speed')),
                ('timestamp', models.DateTimeField(auto_now_add=True, help_text='When this location update was received')),
                ('band', models.ForeignKey(help_text='The band/site whose location is being tracked', on_delete=django.db.models.deletion.CASCADE, related_name='location_history', to='challenges.GeoArSite')),
            ],
            options={
                'verbose_name': 'Band Location',
                'verbose_name_plural': 'Band Locations',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.AddIndex(
            model_name='broadcastmessage',
            index=models.Index(fields=['-created_at'], name='band_tracki_created_3e7aae_idx'),
        ),
        migrations.AddIndex(
            model_name='broadcastmessage',
            index=models.Index(fields=['sent_at'], name='band_tracki_sent_at_95c3c1_idx'),
        ),
        migrations.AddIndex(
            model_name='broadcastmessage',
            index=models.Index(fields=['is_deleted', '-created_at'], name='band_tracki_is_dele_f8b2e3_idx'),
        ),
        migrations.AddIndex(
            model_name='notificationhistory',
            index=models.Index(fields=['message', 'user'], name='band_tracki_message_7a9c8d_idx'),
        ),
        migrations.AddIndex(
            model_name='notificationhistory',
            index=models.Index(fields=['user', '-created_at'], name='band_tracki_user_id_2b4f6e_idx'),
        ),
        migrations.AddIndex(
            model_name='notificationhistory',
            index=models.Index(fields=['delivered', 'read'], name='band_tracki_deliver_e5d7a2_idx'),
        ),
        migrations.AddIndex(
            model_name='bandlocation',
            index=models.Index(fields=['band', '-timestamp'], name='band_tracki_band_id_9c3f5a_idx'),
        ),
        migrations.AddIndex(
            model_name='bandlocation',
            index=models.Index(fields=['-timestamp'], name='band_tracki_timesta_6e8b2d_idx'),
        ),
    ]
