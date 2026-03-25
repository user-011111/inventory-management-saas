from rest_framework import serializers
from django.db.models import Sum

from .models import StockTransfer, Company, Product, Warehouse, WarehouseProduct


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = "__all__"
        read_only_fields = ["company"]


class WarehouseInventorySerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField()

    class Meta:
        model = Product
        fields = ["id", "name", "sku", "quantity"]


class ProductSerializer(serializers.ModelSerializer):
    stock_details = serializers.SerializerMethodField()
    total_company_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "sku", "stock_details", "total_company_stock"]
        read_only_fields = ["company"]

    def get_stock_details(self, obj):
        user = self.context["request"].user

        if user.role == "employee":
            if not user.assigned_warehouse:
                return {
                    "warehouse_name": "N/A",
                    "quantity": 0
                }

            wp = WarehouseProduct.objects.filter(
                warehouse=user.assigned_warehouse,
                product=obj
            ).first()

            return {
                "warehouse_name": user.assigned_warehouse.name,
                "quantity": wp.quantity if wp else 0
            }

        stock_breakdown = WarehouseProduct.objects.filter(
            product=obj,
            warehouse__company=user.company
        ).values("warehouse__name", "quantity")

        return list(stock_breakdown)

    def get_total_company_stock(self, obj):
        user = self.context["request"].user

        total = WarehouseProduct.objects.filter(
            product=obj,
            warehouse__company=user.company
        ).aggregate(Sum("quantity"))["quantity__sum"]

        return total or 0


class StockTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransfer
        fields = [
            "id",
            "product",
            "from_warehouse",
            "to_warehouse",
            "quantity",
            "status",
            "out_approved",
            "in_approved",
            "created_at",
        ]
        read_only_fields = [
            "status",
            "out_approved",
            "in_approved",
            "created_at",
        ]

    def validate(self, data):
        request = self.context["request"]
        company = request.user.company

        product = data.get("product")
        from_warehouse = data.get("from_warehouse")
        to_warehouse = data.get("to_warehouse")

        if product and product.company != company:
            raise serializers.ValidationError(
                "Product must belong to your company"
            )

        if from_warehouse and from_warehouse.company != company:
            raise serializers.ValidationError(
                "Source warehouse must belong to your company"
            )

        if to_warehouse and to_warehouse.company != company:
            raise serializers.ValidationError(
                "Destination warehouse must belong to your company"
            )

        if (
            product and from_warehouse and
            product.company != from_warehouse.company
        ):
            raise serializers.ValidationError(
                "Product and source warehouse must belong to the same company"
            )

        if (
            product and to_warehouse and
            product.company != to_warehouse.company
        ):
            raise serializers.ValidationError(
                "Product and destination warehouse must belong to the same company"
            )

        return data


class StockAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    operation = serializers.ChoiceField(
        choices=[("in", "Stock In"), ("out", "Stock Out")]
    )

    def validate_product_id(self, value):
        request = self.context.get("request")
        user = request.user if request else None

        try:
            product = Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist")

        if user and product.company != user.company:
            raise serializers.ValidationError(
                "Product does not belong to your company"
            )

        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive")
        return value