# Migration to make title, image, and audio fields required

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('randomizer_challenge', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='randomizertrack',
            name='title',
            field=models.CharField(help_text='Title for this track', max_length=255),
        ),
        migrations.AlterField(
            model_name='randomizertrack',
            name='image',
            field=models.ImageField(help_text='Image for this track', upload_to='randomizer/images/'),
        ),
        migrations.AlterField(
            model_name='randomizertrack',
            name='audio',
            field=models.FileField(help_text='Audio file for this track', upload_to='randomizer/audio/'),
        ),
    ]