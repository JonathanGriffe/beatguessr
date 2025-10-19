import pytest

from accounts.models import CustomUser
from quiz.models.question import Question
from quiz.models.playlist import Playlist
from quiz.constants import LEARNED_THRESHOLD, PRACTICE_THRESHOLD
from quiz.models.song import Song
from quiz.services.question import compute_activations, pick_song


@pytest.mark.django_db
def test_compute_activations():
    user = CustomUser.objects.create_user('test', 'test')
    song1 = Song.objects.create(title='', artist='test', image_link='', spotify_id='', popularity=0)
    song2 = Song.objects.create(title='abc', artist='test', image_link='', spotify_id='a', popularity=0)
    no_question_song = Song.objects.create(title='abcd', artist='test', image_link='', spotify_id='b', popularity=0)

    playlist = Playlist.objects.create(title='test', category='test', image_link='', spotify_id='')
    playlist.songs.add(song1, song2, no_question_song)

    Question.objects.create(song=song1, user=user)
    Question.objects.create(song=song2, user=user)

    activations_by_song = compute_activations(user, playlist)

    assert set(activations_by_song.keys()) == {song1.id, song2.id}


@pytest.mark.django_db
def test_pick_song():
    never_guessed_song = Song.objects.create(title='', artist='test', image_link='', spotify_id='', popularity=0)
    training_song = Song.objects.create(title='abc', artist='test', image_link='', spotify_id='a', popularity=0)
    learned_song = Song.objects.create(title='abcd', artist='test', image_link='', spotify_id='b', popularity=0)

    playlist = Playlist.objects.create(title='test', category='test', image_link='', spotify_id='')
    playlist.songs.add(never_guessed_song, training_song, learned_song)

    activations_by_song = {
        training_song.id: PRACTICE_THRESHOLD + 0.01,
        learned_song.id: LEARNED_THRESHOLD + 0.01,
    }

    # picks in priority songs that are being learned
    assert pick_song(activations_by_song, playlist) == training_song.id

    del activations_by_song[training_song.id]

    # else, pick a new song (that doesn't appear in activations_by_song)
    assert pick_song(activations_by_song, playlist) == never_guessed_song.id