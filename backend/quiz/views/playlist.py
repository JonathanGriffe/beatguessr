from collections import defaultdict

from django.db.models import Count
from django.http import JsonResponse
from quiz.constants import PLAYLIST_LIMIT
from quiz.models.playlist import Playlist
from quiz.services.playlist import import_playlist_for_user
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class PlaylistsView(APIView):

    def get(self, request):
        grouped_playlists = defaultdict(list)
        for playlist in Playlist.objects.for_user(request.user):
            grouped_playlists[playlist.category].append(
                {
                    "id": playlist.spotify_id,
                    "title": playlist.title,
                    "image_link": playlist.image_link,
                }
            )

        return JsonResponse(grouped_playlists)


class PlaylistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.playlists.count() >= PLAYLIST_LIMIT:
            return JsonResponse({"error": "You have reached the playlist limit"}, status=400)

        playlist_id = request.data.get("playlist_id")
        playlist = import_playlist_for_user(playlist_id, request.user)

        return JsonResponse(
            {
                "id": playlist.spotify_id,
                "title": playlist.title,
                "image_link": playlist.image_link,
            }
        )

    def delete(self, request):
        playlist_id = request.query_params.get("playlist_id")
        if not playlist_id:
            return JsonResponse({"error": "Playlist ID is required"}, status=400)

        if not request.user.playlists.filter(spotify_id=playlist_id).exists():
            return JsonResponse({"error": "Playlist not found"}, status=404)

        playlist = request.user.playlists.get(spotify_id=playlist_id)

        if playlist.users.count() > 1:
            playlist.users.remove(request.user)
        else:
            playlist.songs.annotate(num_playlists=Count("playlists")).filter(num_playlists=1).delete()
            playlist.delete()

        return JsonResponse({"status": "ok"}, status=200)
