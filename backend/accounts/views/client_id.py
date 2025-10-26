import os

from django.http import JsonResponse
from rest_framework.views import APIView


class ClientIdView(APIView):
    def get(self, request):
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        return JsonResponse({"client_id": client_id})
