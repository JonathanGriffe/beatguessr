from django.urls import re_path
from quiz.consumers import RoomConsumer

websocket_urlpatterns = [
    re_path(r"^ws/room/(?P<room_name>[A-Z]{6})/", RoomConsumer.as_asgi()),
]
