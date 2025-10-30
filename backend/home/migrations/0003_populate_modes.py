# Generated manually to populate modes data

from django.db import migrations


def populate_modes(apps, schema_editor):
    Mode = apps.get_model('home', 'Mode')
    modes_data = [
        {'name': 'Geo-tag', 'status': 'active'},
        {'name': 'Band', 'status': 'active'},
        {'name': 'Hunt', 'status': 'active'},
        {'name': 'Scans', 'status': 'active'},
    ]
    
    for mode_data in modes_data:
        Mode.objects.get_or_create(
            name=mode_data['name'],
            defaults={'status': mode_data['status']}
        )


def reverse_populate_modes(apps, schema_editor):
    Mode = apps.get_model('home', 'Mode')
    mode_names = ['Geo-tag', 'Band', 'Hunt', 'Scans']
    Mode.objects.filter(name__in=mode_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0002_mode'),
    ]

    operations = [
        migrations.RunPython(populate_modes, reverse_populate_modes),
    ]

