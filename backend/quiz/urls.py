from django.urls import path

from quiz.views import QuestionView, AnswerView

urlpatterns = [
    path('question/', QuestionView.as_view()),
    path('answer/', AnswerView.as_view()),
]