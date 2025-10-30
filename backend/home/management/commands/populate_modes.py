from django.core.management.base import BaseCommand
from home.models import Mode


class Command(BaseCommand):
    help = 'Populate the Mode table with initial data (Geo-tag, Band, Hunt, Scans)'

    def handle(self, *args, **options):
        modes_data = [
            {'name': 'Geo-tag', 'status': 'active'},
            {'name': 'Band', 'status': 'active'},
            {'name': 'Hunt', 'status': 'active'},
            {'name': 'Scans', 'status': 'active'},
        ]
        
        created_count = 0
        updated_count = 0
        
        for mode_data in modes_data:
            mode, created = Mode.objects.get_or_create(
                name=mode_data['name'],
                defaults={'status': mode_data['status']}
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created mode: {mode.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'Mode already exists: {mode.name}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Created: {created_count}, Already exists: {updated_count}'
        ))

