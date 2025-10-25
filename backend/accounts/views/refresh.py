from accounts.services.auth import refresh_access_token
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class RefreshView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.token_expires and timezone.now() < user.token_expires:
            return JsonResponse({"access_token": user.access_token})

        access_token = refresh_access_token(user)
        return JsonResponse({"access_token": access_token})
