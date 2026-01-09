# Remove ranking field from RandomizerChallenge

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('randomizer_challenge', '0003_make_fields_required'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='randomizerchallenge',
            name='ranking',
        ),
    ]