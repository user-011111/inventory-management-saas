<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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

>>>>>>> 8e1d48731f15fc8e9707b69950ceaac5dca08b61
