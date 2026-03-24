from django.db.models import OuterRef, Subquery, IntegerField
from django.db.models.functions import Coalesce

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company, StockTransfer, Product, Warehouse, WarehouseProduct
from .serializers import (
    CompanySerializer,
    WarehouseSerializer,
    ProductSerializer,
    StockTransferSerializer,
    StockAdjustmentSerializer,
    WarehouseInventorySerializer,
)


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Company.objects.all()

        if user.role == "owner":
            return Company.objects.filter(owner=user)

        if not user.company:
            return Company.objects.none()

        return Company.objects.filter(id=user.company.id)

    def perform_create(self, serializer):
        if self.request.user.role != "owner":
            raise PermissionDenied("Only owner can create company")
        serializer.save(owner=self.request.user)


class WarehouseViewSet(viewsets.ModelViewSet):
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.company:
            return Warehouse.objects.none()

        return Warehouse.objects.filter(company=user.company)

    def perform_create(self, serializer):
        if self.request.user.role != "owner":
            raise PermissionDenied("Only owner can create warehouse")
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=["get"], url_path="inventory")
    def inventory(self, request, pk=None):
        warehouse = self.get_object()

        # Employee can only view inventory of their assigned warehouse
        if request.user.role == "employee":
            if not request.user.assigned_warehouse:
                raise PermissionDenied("You are not assigned to any warehouse")

            if request.user.assigned_warehouse != warehouse:
                raise PermissionDenied(
                    "You can only view inventory for your assigned warehouse"
                )

        stock_subquery = WarehouseProduct.objects.filter(
            warehouse=warehouse,
            product=OuterRef("pk")
        ).values("quantity")[:1]

        products = Product.objects.filter(
            company=warehouse.company
        ).annotate(
            quantity=Coalesce(
                Subquery(stock_subquery, output_field=IntegerField()),
                0
            )
        ).order_by("name")

        serializer = WarehouseInventorySerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Product.objects.filter(company=user.company)

    def perform_create(self, serializer):
        if self.request.user.role not in ["owner", "manager"]:
            raise PermissionDenied("Not allowed to create product")
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        if self.request.user.role not in ["owner", "manager"]:
            raise PermissionDenied("Not allowed to update product")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ["owner", "manager"]:
            raise PermissionDenied("You do not have permission to delete products.")

        if instance.company != self.request.user.company:
            raise PermissionDenied("You cannot delete products from another company.")

        instance.delete()


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


class StockAdjustmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "employee":
            return Response(
                {"detail": "Only warehouse employees can adjust stock directly"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = StockAdjustmentSerializer(
    data=request.data,
    context={"request": request}
)
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
            warehouse=warehouse,
            product_id=product_id,
            defaults={"quantity": 0}
        )

        if operation == "in":
            wp.quantity += quantity
        else:
            if wp.quantity < quantity:
                return Response(
                    {"detail": "Not enough stock"},
                    status=status.HTTP_400_BAD_REQUEST,
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