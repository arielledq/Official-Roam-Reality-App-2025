# Create default challenge

from django.db import migrations
from django.utils import timezone


def create_default_challenge(apps, schema_editor):
    """Create a single default challenge"""
    RandomizerChallenge = apps.get_model('randomizer_challenge', 'RandomizerChallenge')

    # Only create if no challenges exist
    if not RandomizerChallenge.objects.exists():
        RandomizerChallenge.objects.create(
            name="Default Randomizer Challenge",
            screen_title=["Option 1", "Option 2", "Option 3"],
            created_at=timezone.now(),
            updated_at=timezone.now()
        )


def reverse_create_default_challenge(apps, schema_editor):
    """Remove the default challenge (for migration reversal)"""
    RandomizerChallenge = apps.get_model('randomizer_challenge', 'RandomizerChallenge')
    RandomizerChallenge.objects.filter(name="Default Randomizer Challenge").delete()


class Migration(migrations.Migration):

    dependencies = [
        ('randomizer_challenge', '0004_remove_challenge_ranking'),
    ]

    operations = [
        migrations.RunPython(
            create_default_challenge,
            reverse_create_default_challenge
        ),
    ]