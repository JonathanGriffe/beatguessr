import logging

from django.core.cache import cache
from quiz.constants import QUESTIONS_CACHE_TIMEOUT

logger = logging.getLogger(__name__)


def get_room_key(room_name):
    return f"room-{room_name}"


async def process_room_event(event_name, update_room_func, room_name, channel_layer, username=None, extra_data={}):
    cache_key = get_room_key(room_name)
    room_data = cache.get(cache_key)

    if room_data is None:
        raise ValueError("Room does not exist")

    new_room_data = update_room_func(room_data)
    cache.set(cache_key, new_room_data, QUESTIONS_CACHE_TIMEOUT)

    await channel_layer.group_send(
        room_name,
        {
            "type": event_name,
            "player_name": username,
            "correct_guesses": new_room_data["correct_guesses"],
            "partial_guesses": new_room_data["partial_guesses"],
            "scores": new_room_data["scores"],
            **extra_data,
        },
    )
