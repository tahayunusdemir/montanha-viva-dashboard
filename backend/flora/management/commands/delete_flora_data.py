from django.core.management.base import BaseCommand
from flora.models import Plant


class Command(BaseCommand):
    help = "Deletes all flora data from the database."

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting all flora data...")
        count, _ = Plant.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f"Successfully deleted {count} plant objects.")
        )
