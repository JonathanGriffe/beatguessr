from django.urls import path
from quiz.views import AnswerView, PlaylistsView, PlaylistView, QuestionView

urlpatterns = [
    path("question/", QuestionView.as_view()),
    path("answer/", AnswerView.as_view()),
    path("playlists/", PlaylistsView.as_view()),
    path("playlist/", PlaylistView.as_view()),
]
