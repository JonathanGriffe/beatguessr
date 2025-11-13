import logging
from collections import defaultdict

import numpy as np
from accounts.services.auth import put
from django.db.models.expressions import Window
from django.db.models.functions import RowNumber
from django.utils import timezone
from quiz.constants import LEARNED_THRESHOLD, MIN_HALF_LIFE, PRACTICE_THRESHOLD, RESPONSE_TIMER, WEIGHTS
from quiz.models import Question
from quiz.models.playlist import Playlist

logger = logging.getLogger(__name__)


def compute_activations(user, playlist):
    questions = (
        Question.objects.filter(user=user, song__in=playlist.songs.all())
        .order_by("created_at")
        .annotate(position=Window(expression=RowNumber(), order_by="-created_at"))
        .values("song_id", "created_at", "answered_correctly", "position")
    )

    qs_by_song = defaultdict(list)
    for question in questions:
        qs_by_song[question["song_id"]].append(question)

    activation_by_song = {}
    for song_id, qs in qs_by_song.items():
        activation_by_song[song_id] = song_activation(qs)

    return activation_by_song


def pick_song(activation_by_song, playlist):
    activations = list(activation_by_song.values())
    practice_range_activations = [
        activation for activation in activations if activation > PRACTICE_THRESHOLD and activation < LEARNED_THRESHOLD
    ]

    if practice_range_activations:
        selected_activation = min(practice_range_activations)
        song_id = next(
            song_id for song_id, activation in activation_by_song.items() if activation == selected_activation
        )
        song = playlist.songs.get(id=song_id)
        return song_id
    else:
        song_id = playlist.songs.exclude(id__in=activation_by_song.keys()).order_by("-popularity").first().id
        song = playlist.songs.get(id=song_id)

    logger.info(
        "Selecting new song",
        extra={
            "song_id": song_id,
            "song_title": song.title,
            "song_artist": song.artist,
            "song_popularity": song.popularity,
            "song_activation": activation_by_song[song_id],
        },
    )
    return song_id


def song_activation(questions):
    wins = 0
    losses = 0
    win_streak = 0
    loss_streak = 0
    max_win_streak = 0

    latest_question = None
    for question in questions:
        if question["answered_correctly"]:
            wins += 1
            loss_streak = 0
            win_streak += 1
            max_win_streak = max(max_win_streak, win_streak)
        else:
            losses += 1
            win_streak = 0
            loss_streak += 1

        latest_question = question

    features = np.array([wins, losses, win_streak, loss_streak, max_win_streak])
    weights = np.array(WEIGHTS)
    half_life = 2 ** max(MIN_HALF_LIFE, features @ weights)

    adjusted_time = (timezone.now() - latest_question["created_at"]).total_seconds() / 86400 + latest_question[
        "position"
    ] / 100
    return 2 ** (-adjusted_time / half_life)


def generate_question(user, device_id, playlist_id):
    """Logic to generate or retrieve a quiz question for the user"""
    playlist = Playlist.objects.get(id=playlist_id)
    activations = compute_activations(user, playlist)

    song_id = pick_song(activations, playlist)

    question = Question.objects.create(song_id=song_id, user=user)

    put(
        f"https://api.spotify.com/v1/me/player/play?device_id={device_id}",
        user,
        json={
            "uris": [f"spotify:track:{question.song.spotify_id}"],
            "position_ms": 0,
        },
    )

    return {
        "question_id": question.id,
        "timer_ms": RESPONSE_TIMER * 1000,
    }
