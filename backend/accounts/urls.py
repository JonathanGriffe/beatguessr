from accounts.views import CallbackView, ClientIdView, GuestUserView, LogoutView, RefreshView, UserView
from django.urls import path

urlpatterns = [
    path("callback/", CallbackView.as_view()),
    path("user/", UserView.as_view()),
    path("guest_user/", GuestUserView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("client_id/", ClientIdView.as_view()),
]
