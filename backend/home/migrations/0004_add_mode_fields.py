# Generated manually to add description and sort_order fields to Mode model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0002_mode'),
    ]

    operations = [
        migrations.AddField(
            model_name='mode',
            name='description',
            field=models.TextField(blank=True, help_text='Description of what this mode does'),
        ),
        migrations.AddField(
            model_name='mode',
            name='sort_order',
            field=models.PositiveIntegerField(default=0, help_text='Display order (lower numbers appear first)'),
        ),
        migrations.AlterModelOptions(
            name='mode',
            options={'ordering': ['sort_order', 'name'], 'verbose_name': 'Mode', 'verbose_name_plural': 'Modes'},
        ),
    ]