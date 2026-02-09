# Generated manually for upload status tracking
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('randomizer_challenge', '0010_change_default_approval_to_unapproved'),
    ]

    operations = [
        migrations.AddField(
            model_name='randomizersubmission',
            name='upload_status',
            field=models.CharField(
                choices=[
                    ('uploading', 'Uploading'),
                    ('complete', 'Complete'),
                    ('failed', 'Failed')
                ],
                default='complete',
                help_text='Status of video file upload to S3',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='randomizersubmission',
            name='upload_attempts',
            field=models.IntegerField(
                default=0,
                help_text='Number of upload attempts made'
            ),
        ),
    ]
