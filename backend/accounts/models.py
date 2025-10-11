from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    spotify_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=64)
    access_token = models.CharField(max_length=1024, blank=True, null=True)
    refresh_token = models.CharField(max_length=1024, blank=True, null=True)
    token_expires = models.DateTimeField(blank=True, null=True)