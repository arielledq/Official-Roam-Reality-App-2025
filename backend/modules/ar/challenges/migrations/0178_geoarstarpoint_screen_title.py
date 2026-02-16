# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('challenges', '0177_scanpicture_screen_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='geoarstarpoint',
            name='screen_title',
            field=models.CharField(blank=True, help_text='Title to display on the screen', max_length=200, null=True, verbose_name='Screen Title'),
        ),
    ]

