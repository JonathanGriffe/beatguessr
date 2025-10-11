import random
from accounts.services.auth import get, put
from quiz.constants import RESPONSE_TIMER
from quiz.models import Question
from quiz.models.song import Song

def generate_question(user, device_id):
    """Logic to generate or retrieve a quiz question for the user"""
    res = get(user, 'https://api.spotify.com/v1/me/tracks?limit=1')

    total = res.json()['total']

    song_index = random.randint(0, total - 1)

    song = get(user, f'https://api.spotify.com/v1/me/tracks?limit=1&offset={song_index}').json()['items'][0]['track']
    artist_name = song['artists'][0]['name']
    song_name = song['name']
    spotify_id = song['id']
    image_link = song['album']['images'][0]['url']

    song, _ = Song.objects.get_or_create(
        spotify_id=spotify_id,
        defaults={
            'title': song_name,
            'artist': artist_name,
            'image_link': image_link,
        }
    )

    question = Question.objects.create(song_id=song.id, user=user)

    res = put(user, f'https://api.spotify.com/v1/me/player/play?device_id={device_id}', json={
        'uris': [f'spotify:track:{spotify_id}'],
        'position_ms': 0,
    })




    return {
        "question_id": question.id,
        "timer_ms": RESPONSE_TIMER * 1000,
    }