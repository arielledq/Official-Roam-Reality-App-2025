# Generated for randomizer_challenge app

from django.db import migrations, models
import django.db.models.deletion
import randomizer_challenge.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RandomizerChallenge',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Name of the randomizer challenge', max_length=255)),
                ('screen_title', models.JSONField(blank=True, help_text='Multiple titles to display on the screen (stored as a list)', null=True)),
                ('ranking', models.JSONField(blank=True, default=dict, help_text='Dynamic ranking object for the challenge (e.g., {\'difficulty\': 8, \'popularity\': 5})')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Randomizer Challenge',
                'verbose_name_plural': 'Randomizer Challenges',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RandomizerTrack',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('track_number', models.PositiveIntegerField(help_text='Track number (1-5)')),
                ('title', models.CharField(help_text='Title for this track', max_length=255)),
                ('image', models.ImageField(help_text='Image for this track', upload_to='randomizer/images/')),
                ('audio', models.FileField(help_text='Audio file for this track', upload_to='randomizer/audio/')),
                ('ranking', models.JSONField(blank=True, default=dict, help_text='Dynamic ranking object for this track (e.g., {\'quality\': 8, \'engagement\': 6})')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tracks', to='randomizer_challenge.randomizerchallenge')),
            ],
            options={
                'verbose_name': 'Randomizer Track',
                'verbose_name_plural': 'Randomizer Tracks',
                'ordering': ['challenge', 'track_number'],
                'unique_together': {('challenge', 'track_number')},
            },
        ),
    ]