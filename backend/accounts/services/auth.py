import base64
from datetime import timedelta
from functools import partial
import os
from django.utils import timezone
import requests

from rest_framework.exceptions import NotAuthenticated

def get_auth_header():
    return base64.b64encode(f"{os.environ['SPOTIFY_CLIENT_ID']}:{os.environ['SPOTIFY_CLIENT_SECRET']}".encode()).decode()

def get_callback_url():
    return f"{os.environ['FRONTEND_URL']}/callback/"


def refresh_access_token(user):
    refresh_token = user.refresh_token
    response = requests.post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'redirect_uri': get_callback_url(),
    }, headers={
        'Authorization': f'Basic {get_auth_header()}',
        'Content-Type': 'application/x-www-form-urlencoded',
    })

    if response.status_code != 200:
        raise NotAuthenticated("Failed to refresh Spotify token")

    data = response.json()
    user.access_token = data['access_token']
    if 'refresh_token' in data:
        user.refresh_token = data['refresh_token']
    user.token_expires = timezone.now() + timedelta(seconds=data['expires_in'])

    user.save()
    return user.access_token

def request(method, user, url, headers=None, **kwargs):
    access_token = user.access_token
    if not access_token:
        raise NotAuthenticated("User is not authenticated with Spotify")

    if timezone.now() >= user.token_expires:
        access_token = refresh_access_token(user)

    headers = headers or {}
    headers["Authorization"] = f"Bearer {access_token}"

    response = requests.request(method, url, headers=headers, **kwargs)

    if response.status_code == 401:
        access_token = refresh_access_token(user)

        headers["Authorization"] = f"Bearer {user.access_token}"
        response = requests.request(method, url, headers=headers, **kwargs)
    return response

get = partial(request, 'GET')
post = partial(request, 'POST')
put = partial(request, 'PUT')