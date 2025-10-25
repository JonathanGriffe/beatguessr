from django.db import models


class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    image_link = models.URLField(max_length=500)
    spotify_id = models.CharField(max_length=500, unique=True)
    popularity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} by {self.artist}"
