from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Company, Warehouse, Product, InventoryMovement

admin.site.register(Company)
admin.site.register(Warehouse)
admin.site.register(Product)
admin.site.register(InventoryMovement)

from .models import StockTransfer

admin.site.register(StockTransfer)