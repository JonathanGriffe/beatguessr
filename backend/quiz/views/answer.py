import logging
from datetime import timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.utils import timezone
from quiz.constants import RESPONSE_TIMER
from quiz.models.question import Question
from quiz.services.answer import check_answer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class AnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        answer = request.data.get("text")
        question_id = request.data.get("question_id")

        try:
            question = Question.objects.get(id=question_id, user=user)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Question not found"}, status=404)

        is_title_correct, is_artist_correct = check_answer(question, answer) if answer else (False, False)

        is_title_correct = is_title_correct or question.title_found
        is_artist_correct = is_artist_correct or question.artist_found
        is_correct = is_title_correct and is_artist_correct

        question.answered_correctly = is_correct
        question.title_found = is_title_correct
        question.artist_found = is_artist_correct
        question.save()

        resp = {
            "is_title_correct": is_title_correct,
            "is_artist_correct": is_artist_correct,
        }

        question_expired = timezone.now() - question.created_at > timedelta(seconds=RESPONSE_TIMER)

        if is_correct or question_expired:
            resp["song"] = {
                "title": question.song.title,
                "artist": question.song.artist,
                "image_link": question.song.image_link,
                "spotify_id": question.song.spotify_id,
            }
        elif is_title_correct or is_artist_correct:
            resp["song"] = {}
            if is_title_correct:
                resp["song"]["title"] = question.song.title
            if is_artist_correct:
                resp["song"]["artist"] = question.song.artist

        if not question_expired:
            logger.info(
                "User made a guess",
                extra={
                    "user_id": user.id,
                    "question_id": question.id,
                    "song_id": question.song.id,
                    "is_correct": is_correct,
                    "is_title_correct": is_title_correct,
                    "is_artist_correct": is_artist_correct,
                },
            )
        return JsonResponse(resp)
