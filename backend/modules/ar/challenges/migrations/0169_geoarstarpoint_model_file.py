# Generated manually for adding model_file field to GeoARStarPoint

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('challenges', '0168_armemories_privacy'),
    ]

    operations = [
        migrations.AddField(
            model_name='geoarstarpoint',
            name='model_file',
            field=models.FileField(blank=True, null=True, upload_to='ar/geo_star_point/', verbose_name='3D Model'),
        ),
    ]
