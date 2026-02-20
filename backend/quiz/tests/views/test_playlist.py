import pytest
from accounts.models import CustomUser
from quiz.models.playlist import Playlist
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_playlist_view():
    playlist1 = Playlist.objects.create(title="test", category="test", image_link="", spotify_id="1")
    playlist2 = Playlist.objects.create(title="test2", category="test", image_link="", spotify_id="2")
    playlist3 = Playlist.objects.create(title="test3", category="other", image_link="", spotify_id="3")

    client = APIClient()
    client.force_authenticate(user=CustomUser.objects.create_user(username="test", password="test"))
    response = client.get("/quiz/playlists/")
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"test", "other"}
    assert data["other"] == [{"id": playlist3.spotify_id, "title": "test3", "image_link": ""}]
    assert len(data["test"]) == 2
    assert {"id": playlist1.spotify_id, "title": "test", "image_link": ""} in data["test"]
    assert {"id": playlist2.spotify_id, "title": "test2", "image_link": ""} in data["test"]
