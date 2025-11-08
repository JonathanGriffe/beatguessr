import base64
import os
from datetime import timedelta
from functools import partial

import requests
from django.core.cache import cache
from django.utils import timezone
from rest_framework.exceptions import NotAuthenticated


def get_auth_header():
    return base64.b64encode(
        f"{os.environ['SPOTIFY_CLIENT_ID']}:{os.environ['SPOTIFY_CLIENT_SECRET']}".encode()
    ).decode()


def get_callback_url():
    return f"{os.environ.get('DOMAIN_NAME', 'http://localhost:5173')}/callback/"


def refresh_access_token(user):
    refresh_token = user.refresh_token
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "redirect_uri": get_callback_url(),
        },
        headers={
            "Authorization": f"Basic {get_auth_header()}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    if response.status_code != 200:
        raise NotAuthenticated("Failed to refresh Spotify token")

    data = response.json()
    user.access_token = data["access_token"]
    if "refresh_token" in data:
        user.refresh_token = data["refresh_token"]
    user.token_expires = timezone.now() + timedelta(seconds=data["expires_in"])

    user.save()
    return user.access_token


def get_client_token():
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={"grant_type": "client_credentials"},
        headers={"Authorization": f"Basic {get_auth_header()}"},
    )

    if response.status_code != 200:
        raise NotAuthenticated("Failed to get client token")

    data = response.json()
    client_token = data["access_token"]
    cache.set("service_access_token", client_token, data["expires_in"])

    return client_token


def request(method, url, user=None, headers=None, **kwargs):
    if user is not None:
        access_token = user.access_token
        if not access_token:
            raise NotAuthenticated("User is not authenticated with Spotify")

        if timezone.now() >= user.token_expires:
            access_token = refresh_access_token(user)
    else:
        access_token = cache.get("service_access_token")
        if not access_token:
            access_token = get_client_token()

    headers = headers or {}
    headers["Authorization"] = f"Bearer {access_token}"

    response = requests.request(method, url, headers=headers, **kwargs)

    if response.status_code == 401:
        if user:
            access_token = refresh_access_token(user)
        else:
            access_token = get_client_token()

        headers["Authorization"] = f"Bearer {user.access_token}"
        response = requests.request(method, url, headers=headers, **kwargs)
    return response


get = partial(request, "GET")
post = partial(request, "POST")
put = partial(request, "PUT")
