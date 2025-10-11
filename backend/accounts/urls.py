from django.urls import path

from accounts.views import CallbackView, UserView, RefreshView, LogoutView

urlpatterns = [
    path('callback/', CallbackView.as_view()),
    path('user/', UserView.as_view()),
    path('refresh/', RefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
]