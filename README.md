A Django REST API for managing multi-company warehouse operations, including user roles, warehouse stock, stock transfers, and employee-level stock adjustments
# Inventory Management SaaS – Backend Report

## Overview

This project is a backend system for an Inventory Management SaaS built using Django and Django REST Framework. The system supports multi-company architecture with role-based access control and warehouse-based stock management.

The backend is responsible for:
- Managing companies, users, warehouses, and products
- Tracking stock per warehouse
- Handling stock transfers between warehouses
- Enforcing business rules and permissions
- Providing APIs for frontend consumption

---

## Architecture

The project is divided into two main apps:

### 1. Users App
Handles:
- Authentication (JWT)
- User roles (owner, manager, employee)
- Company assignment
- Warehouse assignment for employees

### 2. Warehouses App
Handles:
- Companies
- Warehouses
- Products
- Warehouse stock (WarehouseProduct)
- Stock transfers
- Stock adjustments

---

## Core Design Decision

### Separation of Product and Stock

A key architectural decision was to separate:
- Product (catalog data)  
- WarehouseProduct (stock data)  

This means:
- Product contains: name, sku, company
- Stock is stored per warehouse using WarehouseProduct

---

## Features Implemented

### Authentication & Authorization
- JWT-based authentication
- Role-based permissions

### Company Management
- Owner creates company
- Data isolation per company

### Warehouse Management
- Warehouses linked to company
- Employee assigned to one warehouse

### Product Management
- Owner/Manager manage products

### Warehouse Inventory Endpoint
GET /api/warehouses/<id>/inventory/

Returns all products with quantity in that warehouse (0 if not present)

### Stock Management
Handled via WarehouseProduct (warehouse + product + quantity)

### Stock Adjustment
POST /api/adjust-stock/

- operation: "in" or "out"
- only employee allowed
- uses assigned warehouse automatically

### Product Stock Visibility
- Owner/Manager: full visibility
- Employee: own warehouse + total company stock only

### Stock Transfers
- Manager creates transfer
- Employees approve (outgoing/incoming)
- Stock updated after both approvals

---

## Security

- Company-based data isolation
- Role-based permissions
- Validation on warehouse and product ownership
- Prevent negative stock

---

## Tech Stack

- Django
- Django REST Framework
- PostgreSQL
- JWT (Simple JWT)
- django-cors-headers

---

## Conclusion

## Setup

```bash
git clone https://github.com/user-011111/inventory-management-saas.git
cd inventory-management-saas
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Notes

- DEBUG is enabled for development
- CORS is fully open
- JWT tokens: 1h access / 7d refresh

## Future Improvements

- Add tests
- Add API docs
- Improve validation
- Add pagination

This backend provides a clean and scalable architecture for inventory management, separating product data from stock, enforcing business rules, and exposing clear APIs.

