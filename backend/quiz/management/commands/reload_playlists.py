from django.core.management.base import BaseCommand
from quiz.models.playlist import Playlist
from quiz.services.playlist import create_playlists


class Command(BaseCommand):
    help = "Create playlists from playlists.json file"

    def handle(self, *args, **options):
        Playlist.objects.all().delete()
        create_playlists()
