from django.http import JsonResponse
from quiz.services.question import generate_question
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class QuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        playlist_id = request.query_params.get("playlist_id")
        device_id = request.query_params.get("device_id")
        mode = request.query_params.get("mode")

        if not device_id:
            return JsonResponse({"error": "Device ID is required"}, status=400)

        if not playlist_id:
            return JsonResponse({"error": "Playlist is required"}, status=400)

        if mode not in ["casual", "training"]:
            return JsonResponse({"error": "Invalid mode"}, status=400)

        generate_question(user, device_id, playlist_id, mode)

        return JsonResponse({"status": "ok"}, status=200)
