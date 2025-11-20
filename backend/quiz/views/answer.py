import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache
from django.http import JsonResponse
from quiz.constants import QUESTIONS_CACHE_TIMEOUT
from quiz.models.question import Question
from quiz.models.song import Song
from quiz.services.answer import check_answer, compute_score
from quiz.services.question import get_user_question_key
from quiz.services.room import process_room_event
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class AnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        answer = request.data.get("text")
        give_up = request.data.get("give_up", False)

        question_key = get_user_question_key(user)
        question_data = cache.get(question_key)
        song = Song.objects.get(id=question_data["song_id"])

        is_title_correct, is_artist_correct = check_answer(song, answer) if answer else (False, False)
        is_title_correct = is_title_correct or question_data.get("is_title_correct", False)
        is_artist_correct = is_artist_correct or question_data.get("is_artist_correct", False)
        answered_correctly = is_title_correct and is_artist_correct

        resp = {
            "is_title_correct": is_title_correct,
            "is_artist_correct": is_artist_correct,
        }

        if give_up or answered_correctly:
            cache.delete(question_key)
            if question_data["mode"] == "training":
                Question.objects.create(
                    user=user, song_id=question_data["song_id"], answered_correctly=answered_correctly
                )
            elif question_data["mode"] == "room" and answered_correctly:
                async_to_sync(process_room_event)(
                    "player_guessed",
                    compute_score(user),
                    question_data["room_name"],
                    get_channel_layer(),
                    user.name,
                )

            resp["song"] = {
                "title": song.title,
                "artist": song.artist,
                "image_link": song.image_link,
                "spotify_id": song.spotify_id,
            }

        elif is_title_correct or is_artist_correct or give_up:
            resp["song"] = {}
            if is_title_correct or give_up:
                resp["song"]["title"] = song.title
            if is_artist_correct or give_up:
                resp["song"]["artist"] = song.artist

            cache.set(
                question_key,
                {
                    "song_id": question_data["song_id"],
                    "mode": question_data["mode"],
                    "room_name": question_data.get("room_name"),
                    "is_title_correct": is_title_correct,
                    "is_artist_correct": is_artist_correct,
                },
                QUESTIONS_CACHE_TIMEOUT,
            )

        logger.info(
            "User made a guess",
            extra={
                "user_id": user.id,
                "give_up": give_up,
                "song_id": question_data["song_id"],
                "is_correct": answered_correctly,
                "is_title_correct": is_title_correct,
                "is_artist_correct": is_artist_correct,
            },
        )
        return JsonResponse(resp)
