import json
import logging
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache
from quiz.constants import QUESTIONS_CACHE_TIMEOUT
from quiz.services.question import get_user_question_key, play_song
from quiz.services.room import get_room_key, process_room_event

logger = logging.getLogger(__name__)


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        qs = parse_qs(self.scope["query_string"].decode())
        user = self.scope["user"]
        room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.device_id = qs.get("device_id")[0]
        self.room_name = room_name
        if not room_name or not user or not self.device_id:
            await self.close()
        room_data = cache.get(get_room_key(room_name))

        if not user.is_authenticated or not room_data:
            await self.close()

        await self.accept()
        await self.channel_layer.group_add(self.room_name, self.channel_name)

        logger.info("User joined room", extra={"room_name": room_name, "user_id": user.id})
        await process_room_event(
            "player_joins",
            lambda data: {**data, "scores": {**data["scores"], user.name: 0}},
            self.room_name,
            self.channel_layer,
            user.name,
        )

    async def disconnect(self, close_code):
        room_data = cache.get(get_room_key(self.room_name))
        if not room_data:
            return
        if self.scope["user"].id == room_data["user_id"]:
            cache.delete(get_room_key(self.room_name))
            await self.channel_layer.group_send(self.room_name, {"type": "room_closed"})
        else:
            await process_room_event(
                "player_leaves",
                lambda data: {
                    **data,
                    "scores": {k: v for k, v in data["scores"].items() if k != self.scope["user"].name},
                },
                self.room_name,
                self.channel_layer,
                self.scope["user"].name,
            )

            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def player_joins(self, event):
        await self.send(text_data=json.dumps(event))

    async def player_leaves(self, event):
        await self.send(text_data=json.dumps(event))

    async def question_starts(self, event):
        await sync_to_async(play_song)(self.scope["user"], self.device_id, event["song_id"])
        cache.set(
            get_user_question_key(self.scope["user"]),
            {"song_id": event["song_id"], "mode": "room", "room_name": self.room_name},
            QUESTIONS_CACHE_TIMEOUT,
        )
        await self.send(text_data=json.dumps({"type": "question_starts", "timer": event["timer"]}))

    async def player_guessed(self, event):
        await self.send(text_data=json.dumps(event))

    async def room_closed(self, event):
        await self.close(code=1000)
