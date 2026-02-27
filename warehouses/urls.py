from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CompanyViewSet,
    WarehouseViewSet,
    ProductViewSet,
    StockTransferViewSet,
    StockAdjustmentView 
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'transfers', StockTransferViewSet, basename='transfer')

# Manually add the stock adjustment endpoint
urlpatterns = router.urls + [
    path('adjust-stock/', StockAdjustmentView.as_view(), name='adjust_stock'),
]