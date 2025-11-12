import os

import sentry_sdk

from .settings import *  # noqa

sentry_sdk.init(
    dsn="https://b61b99261affce2525feb6b4c179858f@o4510352433676288.ingest.de.sentry.io/4510352435314768",
    send_default_pii=True,
)

ALLOWED_HOSTS = [os.environ["DOMAIN_NAME"], f"www.{os.environ['DOMAIN_NAME']}"]


SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
