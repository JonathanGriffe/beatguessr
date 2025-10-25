from unittest.mock import patch

import pytest
from quiz.models.playlist import Playlist
from quiz.models.song import Song
from quiz.services.playlist import create_playlists

TEST_PLAYLIST_ID = "25Li3GPIL8xkoB5FCRedrv"
TEST_PLAYLIST_LENGTH = 27
TEST_LONG_PLAYLIST_ID = "2nTFuPsJjtf5eah07KaKKw"
TEST_LONG_PLAYLIST_LENGTH = 340


@patch("json.load", return_value={"test": [TEST_PLAYLIST_ID]})
@pytest.mark.django_db
def test_create_playlist(load):
    create_playlists()

    playlist = Playlist.objects.get()
    assert playlist
    assert playlist.category == "test"

    assert Song.objects.count() == TEST_PLAYLIST_LENGTH

    assert playlist.songs.count() == TEST_PLAYLIST_LENGTH


@patch("json.load", return_value={"test": [TEST_PLAYLIST_ID]})
@pytest.mark.django_db
def test_create_playlist_already_created(load):
    create_playlists()
    create_playlists()

    playlist = Playlist.objects.get(spotify_id=TEST_PLAYLIST_ID)
    assert playlist

    assert Song.objects.count() == TEST_PLAYLIST_LENGTH


@patch("json.load", return_value={"test": [TEST_LONG_PLAYLIST_ID]})
@pytest.mark.django_db
def test_create_long_playlist(load):
    create_playlists()

    playlist = Playlist.objects.get()
    assert playlist

    assert Song.objects.count() == TEST_LONG_PLAYLIST_LENGTH

    assert playlist.songs.count() == TEST_LONG_PLAYLIST_LENGTH


@patch("json.load", return_value={"test": [TEST_LONG_PLAYLIST_ID, TEST_PLAYLIST_ID]})
@pytest.mark.django_db
def test_create_multiple_playlists(load):
    create_playlists()

    assert Playlist.objects.count() == 2

    assert TEST_LONG_PLAYLIST_LENGTH < Song.objects.count() <= TEST_LONG_PLAYLIST_LENGTH + TEST_PLAYLIST_LENGTH
