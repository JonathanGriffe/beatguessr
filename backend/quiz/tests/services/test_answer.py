from accounts.models import CustomUser
from django.utils import timezone
from quiz.models.question import Question
from quiz.models.song import Song
from quiz.services.answer import check_answer


def create_question(title, artist):
    user = CustomUser(username="test", password="test")
    song = Song(title=title, artist=artist, image_link="", spotify_id="", popularity=0)
    now = timezone.now()
    return Question(song=song, user=user, created_at=now)


def test_check_answer_title():
    question = create_question("title", "artist")

    assert check_answer(question, "titl") == (True, False)
    assert check_answer(question, "title") == (True, False)
    assert check_answer(question, "tiele") == (True, False)
    assert check_answer(question, "teele") == (False, False)
    assert check_answer(question, "titlee") == (True, False)
    assert check_answer(question, "titleee") == (False, False)


def test_check_answer_artist():
    question = create_question("title", "artist")

    assert check_answer(question, "arti") == (False, False)
    assert check_answer(question, "artis") == (False, True)
    assert check_answer(question, "artist") == (False, True)


def test_check_answer_both():
    question = create_question("title", "artist")
    assert check_answer(question, "title artist") == (True, True)

    assert check_answer(question, "artist title") == (True, True)


def test_check_answer_normalization():
    question_special_char = create_question("title$", "artist_")
    assert check_answer(question_special_char, "title artist") == (True, True)

    question_parenthesis = create_question(title="title (abc)", artist="artist")
    assert check_answer(question_parenthesis, "artist title") == (True, True)

    question_dash = create_question(title="title - abc", artist="artist")
    assert check_answer(question_dash, "artist title") == (True, True)
