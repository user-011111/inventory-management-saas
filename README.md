# Inventory Management SaaS Backend

This is the backend of a **Warehouse & Inventory Management SaaS** system built with **Django** and **Django REST Framework**.  
It supports multiple companies, warehouses, and users with role-based permissions.

---

## Project Overview

The system allows companies to manage:

- Products in multiple warehouses
- Stock per warehouse
- Transfers between warehouses with a **2-step approval workflow**
- Multi-role user management

Roles:

| Role      | Permissions / Actions |
|-----------|----------------------|
| Owner     | Can create company, warehouses, products, managers, and employees. Has full access. |
| Manager   | Can create product transfers, view company stock. Cannot create company or warehouses. |
| Employee  | Can approve outgoing or incoming transfers for their assigned warehouse. Cannot create or edit products or transfers. |

---

## Features

- **Multi-tenant system**: Each company’s data is isolated.
- **Role-based permissions**: Owner, Manager, Employee.
- **Warehouse-level stock tracking**.
- **2-step transfer approval workflow**:
  - Employee of `from_warehouse` approves OUT
  - Employee of `to_warehouse` approves IN
  - Stock is updated automatically only after both approvals
- **Secure JWT authentication**
- **Owner can register first account and create other users via API**

---

## Technologies Used

- Python 3.x
- Django 4.x
- Django REST Framework
- PostgreSQL (or SQLite for testing)
- JWT Authentication (via `djangorestframework-simplejwt`)

---

## Installation

1. Clone the repository:

git clone https://github.com/user011111/inventory-management-saas.git
cd inventory-management-saas

2. Create a virtual environment and activate:

python3 -m venv venv
source venv/bin/activate

3. Install dependencies:

pip install -r requirements.txt

4. Apply migrations:

python manage.py migrate

5. Start the server:

python manage.py runserver

API Endpoints (Overview)

Authentication:

    POST /api/token/ → Login, get JWT tokens

    POST /api/token/refresh/ → Refresh token

User Management:

    POST /api/register/ → Register the first Owner

    POST /api/create-user/ → Owner creates Managers or Employees

Company & Warehouse:

    GET /api/companies/ → List companies

    POST /api/companies/ → Create company (Owner only)

    GET /api/warehouses/ → List warehouses

    POST /api/warehouses/ → Create warehouse (Owner only)

Products & Stock:

    GET /api/products/ → List products

    POST /api/products/ → Create product (Owner/Manager)

    Stock is managed per warehouse

Transfers:

    POST /api/transfers/ → Create stock transfer (Manager/Owner)

    PATCH /api/transfers/<id>/ → Approve OUT/IN (Employee)

    Automatic stock update after approvals
Notes

    Employees can only see products and transfers relevant to their assigned warehouse.

    Managers and Owners can see all company data.

    Transfer between warehouses of different companies is blocked.

    Transfer to the same warehouse is blocked.

Getting Started

    Register first Owner via /api/register/

    Login to get JWT token

    Owner creates Manager and Employees via /api/create-user/

    Create company, warehouses, and products

    Manager creates transfers

    Employees approve transfers → stock is updated automatically

Next Steps

    Full testing of all endpoints

    Documentation for frontend integration

    Optional: add automated tests and logs
# inventory-management-saas
