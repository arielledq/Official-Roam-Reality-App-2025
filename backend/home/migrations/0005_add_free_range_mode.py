# Generated manually to add Free Range mode

from django.db import migrations


def add_free_range_mode(apps, schema_editor):
    Mode = apps.get_model('home', 'Mode')
    Mode.objects.get_or_create(
        name='Free Range',
        defaults={
            'status': 'active',
            'description': 'Explore freely without specific challenges or objectives',
            'sort_order': 10  # Place it after the existing modes
        }
    )


def reverse_free_range_mode(apps, schema_editor):
    Mode = apps.get_model('home', 'Mode')
    Mode.objects.filter(name='Free Range').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0004_add_mode_fields'),
    ]

    operations = [
        migrations.RunPython(add_free_range_mode, reverse_free_range_mode),
    ]