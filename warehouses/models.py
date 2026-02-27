from django.db import models
from django.conf import settings
from django.db import transaction
from django.core.exceptions import ValidationError


class Company(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_companies"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Warehouse(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="warehouses"
    )
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Product(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="products"
    )
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class InventoryMovement(models.Model):
    MOVEMENT_TYPES = (
        ("IN", "Stock In"),
        ("OUT", "Stock Out"),
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="movements"
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="movements"
    )
    movement_type = models.CharField(
        max_length=10,
        choices=MOVEMENT_TYPES
    )
    quantity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.movement_type}"


class StockTransfer(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="transfers"
    )
    from_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="outgoing_transfers"
    )
    to_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="incoming_transfers"
    )
    quantity = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    out_approved = models.BooleanField(default=False)
    in_approved = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} transfer"

    def complete_transfer(self):
        if self.out_approved and self.in_approved and self.status == "PENDING":
            with transaction.atomic():
                from_stock = WarehouseProduct.objects.get(
                    warehouse=self.from_warehouse,
                    product=self.product
                )

                if from_stock.quantity < self.quantity:
                    raise ValueError("Not enough stock")

                to_stock, created = WarehouseProduct.objects.get_or_create(
                    warehouse=self.to_warehouse,
                    product=self.product,
                    defaults={"quantity": 0}
                )

                from_stock.quantity -= self.quantity
                to_stock.quantity += self.quantity

                from_stock.save()
                to_stock.save()

                self.status = "COMPLETED"
                super().save(update_fields=["status"])

    def clean(self):
        """Custom validation for StockTransfer"""
        if self.from_warehouse == self.to_warehouse:
            raise ValidationError("Source and destination cannot be the same")

        if self.from_warehouse.company != self.to_warehouse.company:
            raise ValidationError("Warehouses must belong to the same company")

    def save(self, *args, **kwargs):
        self.full_clean()  # runs clean()
        super().save(*args, **kwargs)
        self.complete_transfer()


class WarehouseProduct(models.Model):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="warehouse_products"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="warehouse_products"
    )
    quantity = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("warehouse", "product")

    def __str__(self):
        return f"{self.product.name} - {self.warehouse.name}"