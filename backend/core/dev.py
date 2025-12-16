import os

from .settings import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["backend"]

CORS_ALLOWED_ORIGINS = [
    os.environ.get("FRONTEND_URL"),
]

CSRF_TRUSTED_ORIGINS = [
    os.environ.get("FRONTEND_URL"),
]

CORS_ALLOW_CREDENTIALS = True

SECRET_KEY = "django-insecure-g^=wnppw^xf&sg7cwt^cu5ne+$9o+wt@x&cy0u3612rx64ktls"
