# Generated manually to populate modes data

from django.db import migrations


def populate_modes(apps, schema_editor):
    Mode = apps.get_model('home', 'Mode')
    modes_data = [
        {'name': 'Geo-tag', 'status': 'active', 'description': 'Tag and collect points at specific geographic locations', 'sort_order': 1},
        {'name': 'Band', 'status': 'active', 'description': 'Join bands and collaborate with other users at locations', 'sort_order': 2},
        {'name': 'Hunt', 'status': 'active', 'description': 'Search for and collect stars at various locations', 'sort_order': 3},
        {'name': 'Scans', 'status': 'active', 'description': 'Scan QR codes and objects to earn points', 'sort_order': 4},
    ]

    for mode_data in modes_data:
        Mode.objects.get_or_create(
            name=mode_data['name'],
            defaults={
                'status': mode_data['status'],
                'description': mode_data.get('description', ''),
                'sort_order': mode_data.get('sort_order', 0)
            }
        )


def reverse_populate_modes(apps, schema_editor):
    Mode = apps.get_model('home', 'Mode')
    mode_names = ['Geo-tag', 'Band', 'Hunt', 'Scans']
    Mode.objects.filter(name__in=mode_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0004_add_mode_fields'),
    ]

    operations = [
        migrations.RunPython(populate_modes, reverse_populate_modes),
    ]

