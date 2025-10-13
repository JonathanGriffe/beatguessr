from django.db import models

class Playlist(models.Model):
    spotify_id = models.CharField(max_length=200, unique=True)
    title = models.CharField(max_length=200)
    songs = models.ManyToManyField('quiz.Song')
    image_link = models.URLField(max_length=500)
    category = models.CharField(max_length=200)


    def __str__(self):
        return self.title
