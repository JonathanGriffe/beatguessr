from django.urls import path

from api.views import CallbackView, UserView

urlpatterns = [
    path('callback/', CallbackView.as_view()),
    path('user/', UserView.as_view()),
]