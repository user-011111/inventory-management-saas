from django.urls import path
from .views import RegisterOwnerView, CreateUserView, CurrentUserView

urlpatterns = [
    path("register/", RegisterOwnerView.as_view(), name="register_owner"),
    path("create-user/", CreateUserView.as_view(), name="create_user"),
    path("user/", CurrentUserView.as_view(), name="current_user"),
]