# Generated manually for removing model_file field from GeoARStar

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('challenges', '0169_geoarstarpoint_model_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='geoarstar',
            name='model_file',
        ),
    ]
