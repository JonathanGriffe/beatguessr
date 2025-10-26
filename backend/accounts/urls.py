from accounts.views import CallbackView, LogoutView, RefreshView, UserView
from accounts.views.client_id import ClientIdView
from django.urls import path

urlpatterns = [
    path("callback/", CallbackView.as_view()),
    path("user/", UserView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("client_id/", ClientIdView.as_view()),
]
