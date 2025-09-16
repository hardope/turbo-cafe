from django.urls import path
from . import views

urlpatterns = [
    path('login', views.UserLoginView.as_view(), name='login'),
    path('register', views.UserRegistrationView.as_view(), name='register'),
    path('refresh-token', views.RefreshTokenView.as_view(), name='refresh-token'),
    path('logout', views.UserLogoutView.as_view(), name='logout'),
    path('profile', views.UserProfileView.as_view(), name='profile'),
]
