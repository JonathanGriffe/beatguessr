from collections import defaultdict

from django.http import JsonResponse
from quiz.models.playlist import Playlist
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class PlaylistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        grouped_playlists = defaultdict(list)
        for playlist in Playlist.objects.all():
            grouped_playlists[playlist.category].append(
                {
                    "id": playlist.id,
                    "title": playlist.title,
                    "image_link": playlist.image_link,
                }
            )

        return JsonResponse(grouped_playlists)
