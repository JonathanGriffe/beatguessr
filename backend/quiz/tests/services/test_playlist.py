from unittest.mock import mock_open, patch

import pytest
from accounts.services.auth import get
from quiz.models.playlist import Playlist
from quiz.models.song import Song
from quiz.services.playlist import create_playlists

TEST_PLAYLIST_ID = "25Li3GPIL8xkoB5FCRedrv"
TEST_LONG_PLAYLIST_ID = "2nTFuPsJjtf5eah07KaKKw"


@patch("json.load", return_value={"test": [TEST_PLAYLIST_ID]})
@patch("quiz.services.playlist.open", new_callable=mock_open, read_data="")
@pytest.mark.django_db
def test_create_playlist(open, load):
    create_playlists()

    playlist = Playlist.objects.get()
    assert playlist
    assert playlist.category == "test"

    playlist_length = get(f"https://api.spotify.com/v1/playlists/{playlist.spotify_id}").json()
    print(playlist_length)
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


@patch("json.load", return_value={"test": [TEST_LONG_PLAYLIST_ID]})
@patch("quiz.services.playlist.open", new_callable=mock_open, read_data="")
@pytest.mark.django_db
def test_create_long_playlist(open, load):
    create_playlists()

    playlist = Playlist.objects.get()
    assert playlist

    playlist_length = get(f"https://api.spotify.com/v1/playlists/{playlist.spotify_id}").json()["tracks"]["total"]
    assert Song.objects.count() == playlist_length

    assert playlist.songs.count() == playlist_length


@patch("json.load", return_value={"test": [TEST_LONG_PLAYLIST_ID, TEST_PLAYLIST_ID]})
@patch("quiz.services.playlist.open", new_callable=mock_open, read_data="")
@pytest.mark.django_db
def test_create_multiple_playlists(open, load):
    create_playlists()

    assert Playlist.objects.count() == 2
    playlist, long_playlist = Playlist.objects.all().values_list("spotify_id", flat=True)
    playlist_length = get(f"https://api.spotify.com/v1/playlists/{playlist}").json()["tracks"]["total"]
    long_playlist_length = get(f"https://api.spotify.com/v1/playlists/{long_playlist}").json()["tracks"]["total"]
    assert long_playlist_length < Song.objects.count() <= long_playlist_length + playlist_length
