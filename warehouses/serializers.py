from rest_framework import serializers
from .models import StockTransfer, Company, Product, Warehouse, WarehouseProduct
from django.db.models import Sum
# -----------------------------
# Existing Model Serializers
# -----------------------------
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = "__all__"
        read_only_fields = ["company"]


class ProductSerializer(serializers.ModelSerializer):
    # New dynamic fields
    stock_details = serializers.SerializerMethodField()
    total_company_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "sku", "stock_details", "total_company_stock"]
        read_only_fields = ["company"]

    def get_stock_details(self, obj):
        user = self.context['request'].user
        
        # Scenario A: Employee sees only their warehouse
        if user.role == "employee":
            wp = WarehouseProduct.objects.filter(
                warehouse=user.assigned_warehouse, 
                product=obj
            ).first()
            return {
                "warehouse_name": user.assigned_warehouse.name if user.assigned_warehouse else "N/A",
                "quantity": wp.quantity if wp else 0
            }

        # Scenario B: Owner/Manager sees a breakdown of ALL warehouses
        # Filtered by the user's company to ensure data isolation
        stock_breakdown = WarehouseProduct.objects.filter(
            product=obj,
            warehouse__company=user.company
        ).values('warehouse__name', 'quantity')
        
        return list(stock_breakdown)

    def get_total_company_stock(self, obj):
        user = self.context['request'].user
        # Sum up all quantities for this product across the entire company
        total = WarehouseProduct.objects.filter(
            product=obj,
            warehouse__company=user.company
        ).aggregate(Sum('quantity'))['quantity__sum']
        
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

# -----------------------------
# New Serializer for Employee Stock Adjustment
# -----------------------------
class StockAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    operation = serializers.ChoiceField(choices=[("in", "Stock In"), ("out", "Stock Out")])

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product does not exist")
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive")
        return value
