from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("email", "role", "company", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")

    fieldsets = UserAdmin.fieldsets + (
        ("Business Info", {"fields": ("role", "company")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Business Info", {"fields": ("role", "company")}),
    )