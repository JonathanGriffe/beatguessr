from django.urls import path

from api.views import CallbackView


urlpatterns = [
    path('callback/', CallbackView.as_view()),
]