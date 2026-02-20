from unittest.mock import mock_open, patch

import pytest
from accounts.services.auth import get
from quiz.models.playlist import Playlist
from quiz.models.song import Song
from quiz.services.playlist import create_playlists, get_preview_url

TEST_PLAYLIST_ID = "4NQZ7BKCivE5n9T3Hrlazu"
TEST_TRACK = "40YbWniIEmqy6s58fYXLUh"


@patch("json.load", return_value={"test": [TEST_PLAYLIST_ID]})
@patch("quiz.services.playlist.open", new_callable=mock_open, read_data="")
@pytest.mark.django_db
def test_create_playlist(open, load):
    create_playlists()

    playlist = Playlist.objects.get()
    assert playlist
    assert playlist.category == "test"

    playlist_length = get(f"https://api.spotify.com/v1/playlists/{playlist.spotify_id}").json()
    playlist_length = playlist_length["tracks"]["total"]
    assert Song.objects.count() == playlist_length

    assert playlist.songs.count() == playlist_length


@patch("json.load", return_value={"test": [TEST_PLAYLIST_ID]})
@patch("quiz.services.playlist.open", new_callable=mock_open, read_data="")
@pytest.mark.django_db
def test_create_playlist_already_created(open, load):
    create_playlists()
    create_playlists()

    playlist = Playlist.objects.get(spotify_id=TEST_PLAYLIST_ID)
    assert playlist

    playlist_length = get(f"https://api.spotify.com/v1/playlists/{playlist.spotify_id}").json()["tracks"]["total"]
    assert Song.objects.count() == playlist_length


def test_get_preview_url():
    url = get_preview_url(TEST_TRACK)
    assert url
