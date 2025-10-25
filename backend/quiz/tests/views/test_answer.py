import pytest
from accounts.models import CustomUser
from quiz.models.question import Question
from quiz.models.song import Song
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_answer_view_post():
    user = CustomUser.objects.create_user("test", "test")
    song = Song.objects.create(title="title - abc", artist="artist", image_link="", spotify_id="", popularity=0)
    question = Question.objects.create(song=song, user=user)

    client = APIClient()
    client.force_authenticate(user=user)

    data = {"text": "title", "question_id": question.id}

    response = client.post(
        "/quiz/answer/",
        data,
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json() == {
        "is_title_correct": True,
        "is_artist_correct": False,
        "song": {"title": "title - abc"},
    }

    question.refresh_from_db()
    assert question.answered_correctly is False
    assert question.title_found is True
    assert question.artist_found is False

    data = {"text": "artist", "question_id": question.id}

    response = client.post(
        "/quiz/answer/",
        data,
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json() == {
        "is_title_correct": True,
        "is_artist_correct": True,
        "song": {
            "artist": "artist",
            "title": "title - abc",
            "image_link": "",
            "spotify_id": "",
        },
    }

    question.refresh_from_db()
    assert question.answered_correctly is True
    assert question.artist_found is True
    assert question.title_found is True
