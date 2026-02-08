from accounts.views import ClientIdView, GuestUserView, LoginView, LogoutView, SignupView, UserView
from django.urls import path

urlpatterns = [
    path("user/", UserView.as_view()),
    path("guest_user/", GuestUserView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("client_id/", ClientIdView.as_view()),
    path("login/", LoginView.as_view()),
    path("signup/", SignupView.as_view()),
]
