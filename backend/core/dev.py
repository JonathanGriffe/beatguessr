from .settings import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["backend"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

SECRET_KEY = "django-insecure-g^=wnppw^xf&sg7cwt^cu5ne+$9o+wt@x&cy0u3612rx64ktls"
