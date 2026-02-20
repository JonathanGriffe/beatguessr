from django.db import migrations
from quiz.services.playlist import get_preview_url


def populate_preview_url(apps, schema_editor):
    Song = apps.get_model("quiz", "Song")

    for song in Song.objects.filter(preview_url__isnull=True):
        print(song.spotify_id)
        try:
            preview_url = get_preview_url(song.spotify_id)
        except AttributeError:
            continue
        song.preview_url = preview_url
        song.save(update_fields=["preview_url"])
        song.refresh_from_db()


class Migration(migrations.Migration):

    dependencies = [
        ("quiz", "0007_song_preview_url"),
    ]

    operations = [
        migrations.RunPython(populate_preview_url, reverse_code=migrations.RunPython.noop),
    ]
