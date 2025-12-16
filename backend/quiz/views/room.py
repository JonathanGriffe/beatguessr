import random
import string

from django.core.cache import cache
from django.http import JsonResponse
from quiz.constants import ROOM_TIMEOUT
from quiz.services.room import get_room_key
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class RoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        room_id = "".join(random.choices(string.ascii_uppercase, k=6))
        cache.set(
            get_room_key(room_id),
            {
                "user_id": request.user.id,
                "scores": {request.user.name: 0},
                "partial_guesses": [],
                "correct_guesses": [],
                "current_song_id": None,
            },
            ROOM_TIMEOUT,
        )

        return JsonResponse({"room_name": room_id})
