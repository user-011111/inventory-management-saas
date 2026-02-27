from django.urls import path
from .views import RegisterOwnerView, CreateUserView

urlpatterns = [
    path("register/", RegisterOwnerView.as_view(), name="register_owner"),
    path("create-user/", CreateUserView.as_view(), name="create_user"),
]