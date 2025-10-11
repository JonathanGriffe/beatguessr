from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from quiz.models.question import Question
from quiz.services.answer import check_answer


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

        is_correct = check_answer(question, answer)

        if is_correct:
            question.answered_correctly = True
            question.save()

        return JsonResponse({"is_correct": is_correct})