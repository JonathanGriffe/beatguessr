from quiz.models.song import Song
from quiz.services.answer import check_answer


def test_check_answer_title():
    song = Song(title="title", artist="artist", image_link="", spotify_id="", popularity=0)

    assert check_answer(song, "titl") == (True, False)
    assert check_answer(song, "title") == (True, False)
    assert check_answer(song, "tiele") == (True, False)
    assert check_answer(song, "teele") == (False, False)
    assert check_answer(song, "titlee") == (True, False)
    assert check_answer(song, "titleee") == (False, False)


def test_check_answer_artist():
    song = Song(title="title", artist="artist", image_link="", spotify_id="", popularity=0)

    assert check_answer(song, "arti") == (False, False)
    assert check_answer(song, "artis") == (False, True)
    assert check_answer(song, "artist") == (False, True)


def test_check_answer_both():
    song = Song(title="title", artist="artist", image_link="", spotify_id="", popularity=0)
    assert check_answer(song, "title artist") == (True, True)

    assert check_answer(song, "artist title") == (True, True)


def test_check_answer_normalization():
    song_special_char = Song(title="title$", artist="artist_", image_link="", spotify_id="", popularity=0)

    assert check_answer(song_special_char, "title artist") == (True, True)

    song_parenthesis = Song(title="title (abc)", artist="artist", image_link="", spotify_id="", popularity=0)
    assert check_answer(song_parenthesis, "artist title") == (True, True)

    song_dash = Song(title="title - abc", artist="artist", image_link="", spotify_id="", popularity=0)
    assert check_answer(song_dash, "artist title") == (True, True)
