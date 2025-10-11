from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        question_count = user.questions.count()
        song_count = user.questions.distinct('song').count()
        return JsonResponse({"name": user.name, "question_count": question_count, "song_count": song_count})