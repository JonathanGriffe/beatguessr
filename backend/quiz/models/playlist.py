from django.db import models


class PlaylistQuerySet(models.QuerySet):
    def for_user(self, user):
        return self.filter(models.Q(users__isnull=True) | models.Q(users=user))


class PlaylistManager(models.Manager):
    def get_queryset(self):
        return PlaylistQuerySet(self.model, using=self._db)

    def for_user(self, user):
        return self.get_queryset().for_user(user)


class Playlist(models.Model):
    spotify_id = models.CharField(max_length=200, unique=True)
    title = models.CharField(max_length=200)
    songs = models.ManyToManyField("quiz.Song", related_name="playlists")
    image_link = models.URLField(max_length=500)
    category = models.CharField(max_length=200)
    users = models.ManyToManyField("accounts.CustomUser", related_name="playlists")

    objects = PlaylistManager()

    def __str__(self):
        return self.title
