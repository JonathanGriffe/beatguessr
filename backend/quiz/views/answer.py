from datetime import timedelta
from django.http import JsonResponse
from quiz.constants import RESPONSE_TIMER
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from quiz.models.question import Question
from quiz.services.answer import check_answer
from django.utils import timezone

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
        
        resp = {"is_title_correct": is_title_correct, "is_artist_correct": is_artist_correct}

        if is_correct or timezone.now() - question.created_at > timedelta(seconds=RESPONSE_TIMER):
            resp["song"] = {
                "title": question.song.title,
                "artist": question.song.artist,
                "image_link": question.song.image_link
            }
        elif is_title_correct or is_artist_correct:
            resp["song"] = {}
            if is_title_correct:
                resp["song"]["title"] = question.song.title
            if is_artist_correct:
                resp["song"]["artist"] = question.song.artist

        return JsonResponse(resp)