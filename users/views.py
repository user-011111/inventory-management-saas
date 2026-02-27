from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import CreateUserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied

# Create your views here.
from rest_framework import generics
from .serializers import RegisterSerializer

class RegisterOwnerView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class CreateUserView(generics.CreateAPIView):
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "owner":
            raise PermissionDenied("Only owner can create users")
        serializer.save()