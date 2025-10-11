from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from quiz.services.question import generate_question


class QuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        device_id = request.query_params.get("device_id")
        if not device_id:
            return JsonResponse({"error": "Device ID is required"}, status=400)
        question_data = generate_question(user, device_id)

        return JsonResponse(question_data)