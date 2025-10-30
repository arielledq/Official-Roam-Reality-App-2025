# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('challenges', '0176_alter_geoarstarpoint_elevation'),
    ]

    operations = [
        migrations.AddField(
            model_name='scanpicture',
            name='screen_title',
            field=models.CharField(blank=True, help_text='Title to display on the screen', max_length=200, null=True, verbose_name='Screen Title'),
        ),
    ]

