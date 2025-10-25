from django.core.management.base import BaseCommand
from quiz.services.playlist import create_playlists


class Command(BaseCommand):
    help = "Create playlists from playlists.json file"

    def handle(self, *args, **options):
        create_playlists()
