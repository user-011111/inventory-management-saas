
HEAD
A Django REST API for managing multi-company warehouse operations, including user roles, warehouse stock, stock transfers, and employee-level stock adjustments.

## Overview

This project is a backend service for an inventory and warehouse management system. It is built with Django and Django REST Framework, uses a custom user model, and secures API access with JWT authentication.

The application is organized into two main apps:

- `users` — authentication, owner registration, user creation, and current-user lookup
- `warehouses` — companies, warehouses, products, stock tracking, transfers, and stock adjustments

## Core Features

- Custom user model with role-based access
- Company-based data isolation
- Warehouse management per company
- Product catalog per company
- Stock tracking by warehouse
- Stock transfers between warehouses
- Two-step transfer approval workflow
- Direct stock adjustment endpoint
- JWT authentication
- CORS enabled

## User Roles

### Owner
- Registers account and creates company
- Can create users, warehouses, and products
- Can create and update transfers

### Manager
- Can manage products and create transfers
- Cannot approve transfers

### Employee
- Assigned to a warehouse
- Can approve transfers
- Can adjust stock for their warehouse

## Data Model

- **User**: role, company, assigned warehouse
- **Company**: tenant entity
- **Warehouse**: belongs to company
- **Product**: belongs to company
- **WarehouseProduct**: stock per warehouse
- **StockTransfer**: tracks movement between warehouses

## API Endpoints

### Auth
- POST `/api/register/`
- POST `/api/token/`
- POST `/api/token/refresh/`
- GET `/api/user/`

### Users
- POST `/api/create-user/`

### Core Resources
- `/api/companies/`
- `/api/warehouses/`
- `/api/products/`
- `/api/transfers/`

### Stock Adjustment
- POST `/api/adjust-stock/`

Example:
{
  "product_id": 1,
  "quantity": 10,
  "operation": "in"
}

## Tech Stack

- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- django-cors-headers

## Project Structure

inventory-management-saas/
├── config/
├── users/
├── warehouses/
├── manage.py
├── requirements.txt

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
