import logging
from datetime import timedelta

import requests
from accounts.models import CustomUser
from accounts.services.auth import get_auth_header, get_callback_url
from django.contrib.auth import login
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class CallbackView(APIView):
    def get(self, request):
        code = request.query_params.get("code")

        res = requests.post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": get_callback_url(),
            },
            headers={
                "Authorization": f"Basic {get_auth_header()}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

        data = res.json()
        access_token = data["access_token"]
        refresh_token = data["refresh_token"]
        token_expires = data["expires_in"]

        user_info = requests.get(
            "https://api.spotify.com/v1/me",
            headers={"Authorization": f"Bearer {access_token}"},
        ).json()

        name = user_info["display_name"]
        spotify_id = user_info["id"]

        user, _ = CustomUser.objects.get_or_create(spotify_id=spotify_id, defaults={"username": name, "name": name})
        user.access_token = access_token
        user.refresh_token = refresh_token
        user.token_expires = timezone.now() + timedelta(seconds=token_expires)
        user.save()

        login(request, user)

        return JsonResponse({"message": "Logged in successfully", "access_token": access_token})
