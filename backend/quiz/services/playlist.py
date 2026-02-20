import concurrent
import json
import logging
import re

import requests
from accounts.services.auth import get
from core.settings import BASE_DIR
from quiz.constants import PLAYLIST_SIZE_LIMIT
from quiz.models.playlist import Playlist
from quiz.models.song import Song

logger = logging.getLogger(__name__)


def get_items(playlist_id, user=None):
    item_fields = "next,items(track(name,id,popularity,artists(name),album(images(url))))"
    fields = f"name, images(url),tracks({item_fields})"
    data = get(f"https://api.spotify.com/v1/playlists/{playlist_id}?market=FR&fields={fields}&limit=100").json()
    tracks = [item["track"] for item in data["tracks"]["items"]]
    image_link = data["images"][0]["url"]
    name = data["name"]

    next_url = data["tracks"]["next"]
    i = 0
    if next_url:
        next_url = f"{next_url.split('fields=')[0]}fields={item_fields}"
        while next_url and i < PLAYLIST_SIZE_LIMIT:
            i += 1
            response = get(next_url, user)
            data = response.json()
            for track in data["items"]:
                tracks.append(track["track"])
            next_url = data["next"]

    return name, image_link, tracks


def import_playlist(playlist_id, category, user=None):
    name, image_link, tracks = get_items(playlist_id, user)
    spotify_ids = [track["id"] for track in tracks]
    existing_tracks = Song.objects.filter(spotify_id__in=spotify_ids).values_list("spotify_id", "id")
    existing_track_spotify_ids = [track[0] for track in existing_tracks]
    song_ids = [track[1] for track in existing_tracks]
    tracks_to_add = [track for track in tracks if track["id"] not in existing_track_spotify_ids]

    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:

        def add_preview_url(track):
            try:
                track["preview_url"] = get_preview_url(track["id"])
            except AttributeError:
                return
            return track

        futures = [executor.submit(add_preview_url, track) for track in tracks_to_add]
        enriched_tracks = [future.result() for future in concurrent.futures.as_completed(futures)]

    for track in enriched_tracks:
        if track is None:
            continue
        song = Song.objects.create(
            spotify_id=track["id"],
            title=track["name"],
            artist=track["artists"][0]["name"],
            image_link=track["album"]["images"][0]["url"],
            popularity=track["popularity"],
            preview_url=track["preview_url"],
        )
        song_ids.append(song.id)

    playlist = Playlist.objects.create(spotify_id=playlist_id, title=name, category=category, image_link=image_link)
    if user:
        playlist.users.add(user)
    playlist.songs.set(song_ids)

    return playlist


def get_preview_url(spotify_id):
    res = requests.get(f"https://open.spotify.com/track/{spotify_id}")
    url_regex = re.compile(r"https\:\/\/p\.scdn\.co\/mp3-preview\/[a-z0-9]{30,50}")
    url = url_regex.search(res.text)
    return url.group()


def import_playlist_for_user(playlist_id, user):
    if Playlist.objects.filter(spotify_id=playlist_id).exists():
        playlist = Playlist.objects.get(spotify_id=playlist_id)
        playlist.users.add(user)
        logger.info("Added user to playlist", extra={"playlist_id": playlist.id, "user_id": user.id})
    else:
        playlist = import_playlist(playlist_id, "My Playlists", user)
        logger.info("Imported playlist for user", extra={"playlist_id": playlist.id, "user_id": user.id})
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
