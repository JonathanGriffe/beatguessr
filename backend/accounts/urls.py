from django.urls import path

from accounts.views import CallbackView, UserView

urlpatterns = [
    path('callback/', CallbackView.as_view()),
    path('user/', UserView.as_view()),
]