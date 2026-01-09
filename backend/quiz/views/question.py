from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache
from django.http import JsonResponse
from quiz.constants import QUESTIONS_CACHE_TIMEOUT
from quiz.models.playlist import Playlist
from quiz.models.song import Song
from quiz.services.question import generate_question, get_user_question_key
from quiz.services.room import process_room_event
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class QuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        playlist_id = request.query_params.get("playlist_id")
        room_name = request.query_params.get("room_name")
        timer = request.query_params.get("timer")
        mode = "casual" if room_name else request.query_params.get("mode")

        if not playlist_id:
            return JsonResponse({"error": "Playlist is required"}, status=400)

        if mode not in ["casual", "training"]:
            return JsonResponse({"error": "Invalid mode"}, status=400)

        if room_name and not timer:
            return JsonResponse({"error": "Timer is required"}, status=400)

        if not Playlist.objects.for_user(user).filter(spotify_id=playlist_id).exists():
            return JsonResponse({"error": "Invalid Playlist"}, status=400)

        song_id = generate_question(
            user,
            playlist_id,
            mode,
        )

        preview_url = Song.objects.get(id=song_id).preview_url

        if not room_name:
            cache.set(get_user_question_key(user.id), {"song_id": song_id, "mode": mode}, QUESTIONS_CACHE_TIMEOUT)
        else:
            async_to_sync(process_room_event)(
                "question_starts",
                lambda data: {
                    **data,
                    "song_id": song_id,
                    "correct_guesses": [],
                    "partial_guesses": [],
                },
                room_name,
                get_channel_layer(),
                extra_data={"timer": timer, "song_id": song_id, "preview_url": preview_url},
            )

        return JsonResponse(
            {
                "preview_url": preview_url,
            },
            status=200,
        )
