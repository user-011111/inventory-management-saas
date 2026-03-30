# Inventory Management SaaS

A Django REST API for managing multi-company warehouse operations, including role-based access control, warehouse stock tracking, stock transfers, and employee stock adjustments.

## Overview

This project is a backend system for an Inventory Management SaaS built with Django and Django REST Framework.

It supports:
- Multi-company architecture
- Role-based access control
- Warehouse-based inventory tracking
- Stock transfers between warehouses
- Employee-level stock adjustments
- JWT authentication for API access

## Tech Stack

- Django 6
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-cors-headers

## Project Structure

The backend is organized into two main apps:

### `users`
Handles:
- Authentication
- Owner registration
- User creation
- Role management
- Company assignment
- Employee warehouse assignment

### `warehouses`
Handles:
- Companies
- Warehouses
- Products
- Warehouse inventory
- Stock transfers
- Stock adjustments

## Core Design Decision

### Separation of Product and Stock

The system separates product catalog data from stock data:

- `Product`: shared catalog information such as name, SKU, and company
- `WarehouseProduct`: warehouse-specific stock quantity for a product

## Main Features

### Authentication and Authorization
- JWT-based authentication
- Role-based permissions
- Company-level data isolation

### Company Management
- Owners can create companies
- Each company's data is isolated from others

### Warehouse Management
- Warehouses belong to a company
- Employees can be assigned to a warehouse

### Product Management
- Owners and managers can manage products

### Inventory Tracking
- Inventory is stored per warehouse
- Stock quantities are managed through warehouse-product relationships

### Stock Adjustment
Endpoint:

POST /api/adjust-stock/

- Supports `in` and `out` operations
- Intended for employees
- Uses the employee's assigned warehouse automatically

### Stock Transfers
Endpoint group:

/api/transfers/

- Managers create stock transfers
- Employees approve outgoing and incoming transfer steps
- Stock updates after both approvals are completed

## API Endpoints

### Authentication
- POST /api/token/
- POST /api/token/refresh/

### Users
- POST /api/register/
- POST /api/create-user/
- GET /api/user/

### Warehouse Domain
- /api/companies/
- /api/warehouses/
- /api/products/
- /api/transfers/
- POST /api/adjust-stock/

## Setup

### 1. Clone the repository
git clone https://github.com/user-011111/inventory-management-saas.git
cd inventory-management-saas

### 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

On Windows:
venv\Scripts\activate

### 3. Install dependencies
pip install -r requirements.txt

### 4. Configure PostgreSQL

Update the database settings in config/settings.py if needed.

### 5. Run migrations
python manage.py migrate

### 6. Start the development server
python manage.py runserver

## Development Notes

- DEBUG = True
- CORS is open to all origins
- JWT access token lifetime is 1 hour
- JWT refresh token lifetime is 7 days

## Future Improvements

- Add automated tests
- Add API documentation
- Improve validation
- Add pagination
- Move secrets to environment variables
