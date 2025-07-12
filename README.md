# Robust Shop Backend API

Welcome to the **Shop Backend API**! This project powers a dynamic online shop, providing a secure and scalable foundation for managing users, products, orders, and more. Built with TypeScript, it emphasizes strong typing, maintainable code, and comprehensive API capabilities. 🚀

## Description

This backend service is the heart of a modern Shop platform. It offers a comprehensive suite of RESTful APIs and real-time communication features, meticulously designed to handle critical business logic. From secure user authentication and product catalog management to order processing and email notifications, this API is engineered for efficiency and reliability. Leveraging PostgreSQL for robust data storage and TypeScript for enhanced code quality, it ensures a seamless and responsive experience. 🛡️

## Installation

Getting this project up and running on your local machine is straightforward! Follow these steps to set up your development environment:

### 1. Clone the Repository

First, grab a copy of the project files by cloning the repository:

```bash
git clone https://github.com/thevalidcode/shop-backend.git
cd shop-backend
```

### 2. Install Dependencies

Navigate into the project directory and install all necessary Node.js packages using npm:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root of your project based on the variables found in `src/config/env.ts`. This file will hold your sensitive credentials and configuration settings.

```dotenv
NODE_ENV=development
PORT=7030
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
MASTER_KEY=your_32_character_encryption_key_here
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_express_session_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RATE_KEY=your_currency_api_key # e.g., from apilayer.net
```

### 4. Database Setup

This project uses PostgreSQL. Make sure you have a PostgreSQL server running and create a new database.

After setting up your database and configuring the `.env` file, run the database migrations to create the necessary tables:

```bash
npm run dev:migrate
```

### 5. Run the Application

Now you're ready to start the backend service!

#### Development Mode

For development with hot-reloading:

```bash
npm run dev
```

The server should start on `http://localhost:7030/`.

#### Production Mode

To build and run the application for production:

```bash
npm run build
npm start
```

## Usage

Once the server is running, you can interact with the API using a frontend application, Postman, cURL, or any HTTP client.

### API Endpoints

The API exposes various endpoints covering different aspects of the Shop platform. Here’s a glimpse of the main routes:

- **`/user`**: User authentication, registration, and user management for admins.
- **`/shop`**: Retrieve shop-specific data, including styles, site information, exchange rates, and current user/admin details.
- **`/blog`**: Manage blog posts (create, read, update, delete).
- **`/faq`**: Handle Frequently Asked Questions (CRUD operations).
- **`/product`**: Manage product catalog (public and admin-specific endpoints).
- **`/category`**: Organize products into categories.
- **`/order`**: Place, retrieve, and manage customer orders.
- **`/version`**: Get the current API version.
- **`/admin`**: Admin login and logout.
- **`/api/auth/shop`**: Google OAuth authentication.

### Authentication

Most administrative and user-specific endpoints are protected. Authentication is handled via JWT tokens, which are managed through cookies. For protected routes, ensure your requests include the `auth_token` cookie.

### API Documentation (Swagger)

This project integrates Swagger for comprehensive API documentation. Once the server is running, you can access the interactive API documentation at:

```
http://localhost:7030/api-docs
```

This interface allows you to explore all available endpoints, their expected parameters, and response structures, making API integration a breeze.

## Features

- **User Management**: Robust user registration, login, and profile management with email and Google OAuth support.
- **Role-Based Access Control**: Differentiated access for users and administrators.
- **Product Catalog**: Comprehensive CRUD operations for managing products, including detailed attributes and categorization.
- **Order Processing**: Streamlined workflows for placing, tracking, and managing customer orders.
- **Dynamic CORS**: CORS origins are dynamically loaded from the database, ensuring secure and flexible access for various shop domains.
- **Email Notifications**: Automated email system for user actions (new user, funds added) and admin alerts (new orders, failed transactions, support tickets).
- **Scheduled Tasks (Cron Jobs)**: Automated fetching and saving of real-time currency exchange rates.
- **Real-time Communication**: WebSocket integration via Socket.IO for features like live support ticket messages and user status updates.
- **Data Validation**: Strict input validation using Zod schemas to ensure data integrity and security.
- **Secure Data Storage**: Custom CRUD operations interacting with PostgreSQL, designed for extensibility and performance.
- **Centralized Configuration**: Environment variables and dedicated configuration files for easy management of database connections, secrets, and other settings.
- **API Versioning**: Endpoint for transparently displaying the API's current version.

## Technologies Used

| Technology          | Description                                                                | Link                                                       |
| :------------------ | :------------------------------------------------------------------------- | :--------------------------------------------------------- |
| **TypeScript**      | A strongly typed superset of JavaScript that compiles to plain JavaScript. | [TypeScript](https://www.typescriptlang.org/)              |
| **Node.js**         | A JavaScript runtime built on Chrome's V8 JavaScript engine.               | [Node.js](https://nodejs.org/)                             |
| **Express.js**      | Fast, unopinionated, minimalist web framework for Node.js.                 | [Express.js](https://expressjs.com/)                       |
| **PostgreSQL**      | A powerful, open-source object-relational database system.                 | [PostgreSQL](https://www.postgresql.org/)                  |
| **Zod**             | A TypeScript-first schema declaration and validation library.              | [Zod](https://zod.dev/)                                    |
| **Socket.IO**       | A library that enables real-time, bidirectional communication.             | [Socket.IO](https://socket.io/)                            |
| **jsonwebtoken**    | An implementation of JSON Web Tokens (JWT).                                | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |
| **bcrypt**          | A library to help you hash passwords.                                      | [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)          |
| **Nodemailer**      | A module for Node.js applications to allow easy as cake email sending.     | [Nodemailer](https://nodemailer.com/about/)                |
| **Axios**           | Promise based HTTP client for the browser and node.js.                     | [Axios](https://axios-http.com/)                           |
| **node-cron**       | A simple cron for Node.js.                                                 | [node-cron](https://github.com/node-cron/node-cron)        |
| **express-session** | Simple session middleware for Express.                                     | [express-session](https://github.com/expressjs/session)    |
| **csurf**           | CSRF protection middleware for Express.                                    | [csurf](https://github.com/expressjs/csurf)                |
| **uuid**            | For the creation of RFC-compliant UUIDs.                                   | [uuid](https://github.com/uuidjs/uuid)                     |

## License

This project is licensed under the [MIT License](LICENSE).

## Author Info

👋 Hi there! I'm Ibe Precious, the developer behind this project. I'm passionate about building robust and scalable backend systems with a keen eye for clean architecture and security.

- **GitHub**: [Ibe Precious](https://github.com/thevalidcode)
- **LinkedIn**: [Ibe Precious](https://www.linkedin.com/in/thevalidcode)

## Badges

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
