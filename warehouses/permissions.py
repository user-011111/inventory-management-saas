from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "owner"


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "manager"


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "employee"