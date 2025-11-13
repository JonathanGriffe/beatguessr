import logging

from django.core.cache import cache
from django.http import JsonResponse
from quiz.constants import QUESTIONS_CACHE_TIMEOUT
from quiz.models.question import Question
from quiz.models.song import Song
from quiz.services.answer import check_answer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class AnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        answer = request.data.get("text")
        give_up = request.data.get("give_up", False)

        solution = cache.get(f"question-{user.id}")
        song = Song.objects.get(id=solution["song_id"])

        is_title_correct, is_artist_correct = check_answer(song, answer) if answer else (False, False)
        is_title_correct = is_title_correct or solution.get("is_title_correct", False)
        is_artist_correct = is_artist_correct or solution.get("is_artist_correct", False)
        answered_correctly = is_title_correct and is_artist_correct

        resp = {
            "is_title_correct": is_title_correct,
            "is_artist_correct": is_artist_correct,
        }

        if give_up or answered_correctly:
            cache.delete(f"question-{user.id}")
            Question.objects.create(user=user, song_id=solution["song_id"], answered_correctly=answered_correctly)
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
                f"question-{user.id}",
                {
                    "song_id": solution["song_id"],
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
                "song_id": solution["song_id"],
                "is_correct": answered_correctly,
                "is_title_correct": is_title_correct,
                "is_artist_correct": is_artist_correct,
            },
        )
        return JsonResponse(resp)
