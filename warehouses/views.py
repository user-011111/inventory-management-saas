from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Company, StockTransfer, Product, Warehouse, WarehouseProduct
from .serializers import (
    CompanySerializer,
    WarehouseSerializer,
    ProductSerializer,
    StockTransferSerializer,
    StockAdjustmentSerializer,
)

# -----------------------------
# Company ViewSet
# -----------------------------
class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user  # ✅ properly indented

        # Superuser sees all companies
        if user.is_superuser:
            return Company.objects.all()

        # Owner sees only their company
        if user.role == "owner":
            return Company.objects.filter(owner=user)

        # If user has no company assigned
        if not user.company:
            return Company.objects.none()

        # Employee sees their assigned company
        return Company.objects.filter(id=user.company.id)

    def perform_create(self, serializer):
        if self.request.user.role != "owner":
            raise PermissionDenied("Only owner can create company")
        serializer.save(owner=self.request.user)

# -----------------------------
# Warehouse ViewSet
# -----------------------------
class WarehouseViewSet(viewsets.ModelViewSet):
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Warehouse.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        if self.request.user.role != "owner":
            raise PermissionDenied("Only owner can create warehouse")
        serializer.save(company=self.request.user.company)


# -----------------------------
# Product ViewSet
# -----------------------------
class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "employee":
            return Product.objects.filter(
                warehouse_products__warehouse=user.assigned_warehouse
            )
        return Product.objects.filter(company=user.company)

    def perform_create(self, serializer):
        if self.request.user.role not in ["owner", "manager"]:
            raise PermissionDenied("Not allowed to create product")
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        if self.request.user.role not in ["owner", "manager"]:
            raise PermissionDenied("Not allowed to update product")
        serializer.save()


# -----------------------------
# StockTransfer ViewSet
# -----------------------------
class StockTransferViewSet(viewsets.ModelViewSet):
    serializer_class = StockTransferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StockTransfer.objects.filter(
            product__company=self.request.user.company
        )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ["owner", "manager"]:
            raise PermissionDenied("Only manager or owner can create transfer")
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        transfer = self.get_object()

        if user.role == "owner":
            serializer.save()
            return

        if user.role == "manager":
            raise PermissionDenied("Manager cannot approve transfers")

        if user.role == "employee":
            if transfer.from_warehouse == user.assigned_warehouse:
                serializer.save(out_approved=True)
                return
            if transfer.to_warehouse == user.assigned_warehouse:
                serializer.save(in_approved=True)
                return

        raise PermissionDenied("Not allowed to approve this transfer")


# -----------------------------
# Stock Adjustment API (Employee only)
# -----------------------------
class StockAdjustmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "employee":
            return Response(
                {"detail": "Only warehouse employees can adjust stock directly"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]
        operation = serializer.validated_data["operation"]

        warehouse = request.user.assigned_warehouse
        if not warehouse:
            return Response(
                {"detail": "You are not assigned to any warehouse"},
                status=status.HTTP_403_FORBIDDEN,
            )

        wp, _ = WarehouseProduct.objects.get_or_create(
            warehouse=warehouse, product_id=product_id, defaults={"quantity": 0}
        )

        if operation == "in":
            wp.quantity += quantity
        else:
            if wp.quantity < quantity:
                return Response(
                    {"detail": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST
                )
            wp.quantity -= quantity

        wp.save()

        return Response(
            {
                "product_id": product_id,
                "warehouse_id": warehouse.id,
                "quantity": wp.quantity,
                "operation": operation,
            },
            status=status.HTTP_200_OK,
        )