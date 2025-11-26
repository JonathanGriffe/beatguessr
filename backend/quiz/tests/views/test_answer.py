import pytest
from accounts.models import CustomUser
from django.core.cache import cache
from quiz.constants import QUESTIONS_CACHE_TIMEOUT
from quiz.models.question import Question
from quiz.models.song import Song
from quiz.services.question import get_user_question_key
from rest_framework.test import APIClient


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("post_data", "response"),
    [
        (
            {"text": "title artist"},
            {
                "is_title_correct": True,
                "is_artist_correct": True,
                "song": {"title": "title - abc", "artist": "artist", "image_link": "", "spotify_id": ""},
            },
        ),
        ({"text": "abc"}, {"is_title_correct": False, "is_artist_correct": False}),
        ({"text": "artist"}, {"is_title_correct": False, "is_artist_correct": True, "song": {"artist": "artist"}}),
        ({"text": "title"}, {"is_title_correct": True, "is_artist_correct": False, "song": {"title": "title - abc"}}),
        (
            {"give_up": True},
            {
                "is_title_correct": False,
                "is_artist_correct": False,
                "song": {"title": "title - abc", "artist": "artist", "image_link": "", "spotify_id": ""},
            },
        ),
    ],
)
@pytest.mark.parametrize("mode", ["training", "casual"])
def test_answer_view_post(mode, post_data, response):
    user = CustomUser.objects.create_user("test", "test")
    song = Song.objects.create(title="title - abc", artist="artist", image_link="", spotify_id="", popularity=0)
    cache.set(get_user_question_key(user.id), {"song_id": song.id, "mode": mode}, QUESTIONS_CACHE_TIMEOUT)

    client = APIClient()
    client.force_authenticate(user=user)

    res = client.post(
        "/quiz/answer/",
        post_data,
        content_type="application/json",
    )

    assert res.status_code == 200
    assert res.json() == response

    if mode == "training" and (
        "give_up" in post_data or (response["is_title_correct"] and response["is_artist_correct"])
    ):
        question = Question.objects.get(user=user, song=song)
        assert question.answered_correctly == (response["is_title_correct"] and response["is_artist_correct"])
    else:
        assert not Question.objects.filter(user=user, song=song).exists()
