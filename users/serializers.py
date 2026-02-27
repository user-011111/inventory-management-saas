from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from warehouses.models import Company, Warehouse

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "company_name"]

    @transaction.atomic
    def create(self, validated_data):
        company_name = validated_data.pop("company_name")
        password = validated_data.pop("password")

        # Step 1: Create user (without company first)
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email"),
            role="owner",
        )
        user.set_password(password)
        user.save()

        # Step 2: Create company with owner
        company = Company.objects.create(
            name=company_name,
            owner=user
        )

        # Step 3: Attach company to user
        user.company = company
        user.save()

        return user


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[("manager", "Manager"), ("employee", "Employee")]
    )
    assigned_warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
            "assigned_warehouse",
        ]

    def validate(self, data):
        # Employee must have a warehouse assigned
        if data["role"] == "employee" and not data.get("assigned_warehouse"):
            raise serializers.ValidationError(
                "Employee must be assigned to a warehouse"
            )

        # Manager cannot have a warehouse
        if data["role"] == "manager" and data.get("assigned_warehouse"):
            raise serializers.ValidationError(
                "Manager cannot be assigned to a warehouse"
            )

        return data

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)

        # Assign same company as authenticated owner
        user.company = self.context["request"].user.company

        user.save()
        return user