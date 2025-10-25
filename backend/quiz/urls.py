from django.urls import path
from quiz.views import AnswerView, QuestionView
from quiz.views.playlist import PlaylistView

urlpatterns = [
    path("question/", QuestionView.as_view()),
    path("answer/", AnswerView.as_view()),
    path("playlists/", PlaylistView.as_view()),
]
