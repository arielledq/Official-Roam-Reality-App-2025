# Generated manually for extending RandomizerChallenge model

import ckeditor.fields
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import randomizer_challenge.models


class Migration(migrations.Migration):

    dependencies = [
        ('challenges', '0001_initial'),  # Assuming AR challenges app is named 'challenges'
        ('randomizer_challenge', '0006_auto_20260121_0956'),
    ]

    operations = [
        migrations.AddField(
            model_name='randomizerchallenge',
            name='thumbnail',
            field=models.ImageField(
                blank=True,
                help_text='Thumbnail image for the challenge',
                null=True,
                upload_to='randomizer/thumbnails/',
                validators=[
                    randomizer_challenge.models.validate_file_size,
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'webp']
                    )
                ]
            ),
        ),
        migrations.AddField(
            model_name='randomizerchallenge',
            name='points',
            field=models.IntegerField(
                default=0,
                help_text='Points awarded for completing this challenge'
            ),
        ),
        migrations.AddField(
            model_name='randomizerchallenge',
            name='sponsor',
            field=models.ForeignKey(
                blank=True,
                help_text='Challenge sponsor',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='randomizer_challenges',
                to='challenges.sponsor'
            ),
        ),
        migrations.AddField(
            model_name='randomizerchallenge',
            name='is_active',
            field=models.BooleanField(
                default=True,
                help_text='Whether this challenge is visible and active'
            ),
        ),
        migrations.AddField(
            model_name='randomizerchallenge',
            name='description',
            field=ckeditor.fields.RichTextField(
                blank=True,
                help_text='Detailed description of the challenge',
                null=True
            ),
        ),
    ]
