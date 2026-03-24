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

        user = User(
            username=validated_data["username"],
            email=validated_data.get("email"),
            role="owner",
        )
        user.set_password(password)
        user.save()

        company = Company.objects.create(
            name=company_name,
            owner=user
        )

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
        request = self.context["request"]
        owner_company = request.user.company
        assigned_warehouse = data.get("assigned_warehouse")
        role = data["role"]

        if role == "employee" and not assigned_warehouse:
            raise serializers.ValidationError(
                "Employee must be assigned to a warehouse"
            )

        if role == "manager" and assigned_warehouse:
            raise serializers.ValidationError(
                "Manager cannot be assigned to a warehouse"
            )

        if assigned_warehouse and assigned_warehouse.company != owner_company:
            raise serializers.ValidationError(
                "Assigned warehouse must belong to your company"
            )

        return data

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.company = self.context["request"].user.company
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "company",
            "assigned_warehouse",
        ]