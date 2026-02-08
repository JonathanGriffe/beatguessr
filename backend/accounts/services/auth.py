import base64
import logging
import os
from functools import partial

import requests
from django.core.cache import cache
from rest_framework.exceptions import NotAuthenticated

logger = logging.getLogger(__name__)


def get_auth_header():
    """
    Computes the header used to make client requests to the Spotify API
    """
    return base64.b64encode(
        f"{os.environ['SPOTIFY_CLIENT_ID']}:{os.environ['SPOTIFY_CLIENT_SECRET']}".encode()
    ).decode()


def get_callback_url():
    """
    Computes the callback URL used to login to Spotify
    """
    if os.environ.get("DOMAIN_NAME"):
        return f"https://{os.environ.get('DOMAIN_NAME')}/callback/"
    else:
        return f"{os.environ.get('FRONTEND_URL')}/callback/"


def get_client_token():
    """
    Uses the client credentials to get a server token
    """
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

    logger.info("Got client token")
    return client_token


def request(method, url, headers=None, **kwargs):
    access_token = cache.get("service_access_token")
    if not access_token:
        access_token = get_client_token()

    headers = headers or {}
    headers["Authorization"] = f"Bearer {access_token}"

    response = requests.request(method, url, headers=headers, **kwargs)

    if response.status_code == 401:
        access_token = get_client_token()
        headers["Authorization"] = f"Bearer {access_token}"

        response = requests.request(method, url, headers=headers, **kwargs)
    return response


get = partial(request, "GET")
post = partial(request, "POST")
put = partial(request, "PUT")
