import json
import os
from accounts.services.auth import get
from core.settings import BASE_DIR
from quiz.models.playlist import Playlist
from quiz.models.song import Song

def get_items(playlist_id):
    market = os.environ['MARKET']
    item_fields = 'next,items(track(name,id,popularity,artists(name),album(images(url))))'
    fields = f'name, images(url),tracks({item_fields})'
    data = get(f'https://api.spotify.com/v1/playlists/{playlist_id}?market={market}&fields={fields}').json()
    tracks = [item["track"] for item in data['tracks']['items']]
    image_link = data['images'][0]['url']
    name = data['name']

    next_url = data['tracks']['next']
    if next_url:
        next_url = f"{next_url.split('fields=')[0]}fields={item_fields}"
        while next_url:
            response = get(next_url)
            data = response.json()
            for track in data['items']:
                tracks.append(track["track"])
            next_url = data['next']

    return name, image_link, tracks

def import_playlist(playlist_id, category):
    song_ids = []
    name, image_link, tracks = get_items(playlist_id)
    for track in tracks:
        song, created = Song.objects.get_or_create(
            spotify_id=track['id'],
            defaults={
                'title': track['name'],
                'artist': track['artists'][0]['name'],
                'image_link': track['album']['images'][0]['url'],
                'popularity': track['popularity'],
            }
        )
        song_ids.append(song.id)

    playlist = Playlist.objects.create(spotify_id=playlist_id, title=name, category=category, image_link=image_link)
    playlist.songs.set(song_ids)

    return playlist


def create_playlists():
    playlists_file_path = BASE_DIR / "playlists.json"
    with open(playlists_file_path, "r") as f:
        data = json.load(f)

    for category, playlists in data.items():
        for spotify_id in playlists:
            if Playlist.objects.filter(spotify_id=spotify_id).exists():
                playlist_name = Playlist.objects.get(spotify_id=spotify_id).title
                print(f"Playlist {playlist_name} already exists")
            else:
                playlist = import_playlist(spotify_id, category)
                print(f"Playlist {playlist.title} created")
