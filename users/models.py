from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("manager", "Manager"),
        ("employee", "Employee"),
    )

    company = models.ForeignKey(
        "warehouses.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="employee"
    )

    assigned_warehouse = models.ForeignKey(
        "warehouses.Warehouse",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="warehouse_employees"
    )

    def __str__(self):
        return f"{self.username} - {self.role}"