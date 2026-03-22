from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import RegisterSerializer, CreateUserSerializer, UserSerializer


# Register Owner
class RegisterOwnerView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# Owner creates Manager / Employee
class CreateUserView(generics.CreateAPIView):
    serializer_class = CreateUserSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "owner":
            raise PermissionDenied("Only owner can create users")
        serializer.save()


# Get Current Logged-in User (VERY IMPORTANT FOR FRONTEND)
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)