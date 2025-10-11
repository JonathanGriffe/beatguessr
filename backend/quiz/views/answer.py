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

        is_correct = check_answer(question, answer) if answer else False

        if is_correct:
            question.answered_correctly = True
            question.save()
        
        resp = {"is_correct": is_correct}

        if is_correct or timezone.now() - question.created_at > timedelta(seconds=RESPONSE_TIMER):
            resp["song"] = {
                "title": question.song.title,
                "artist": question.song.artist,
                "image_link": question.song.image_link
            }
        return JsonResponse(resp)