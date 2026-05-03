# LaptopVerse Project Specification

## Project Overview

LaptopVerse is a full-stack e-commerce platform for laptop shopping built as a monorepo with separate `client` and `server` applications.

- `client/`: React + TypeScript storefront and user experience.
- `server/`: Express + TypeScript backend API with MongoDB persistence.
- Shared goal: provide secure authentication, product discovery, cart and order workflows, payment integration, and administrative management.

## Architecture

### Frontend

- Built with React 19 and Vite.
- Uses React Router v7 for client-side navigation.
- State management via Redux Toolkit.
- Uses Tailwind CSS, ShadCN UI utilities, and Sonner for notifications.
- Feature-based directory structure under `src/features/` for auth, cart, comparison, order, and product flows.
- Layout and common UI components are organized under `src/components/`.

### Backend

- Built with Express 5 and TypeScript.
- Connects to MongoDB via Mongoose.
- Uses Passport / Google OAuth for authentication support and JWT for sessions.
- Includes security and robustness middleware:
  - `helmet` for HTTP headers
  - `express-rate-limit` for rate limiting
  - request body size limits
  - global error handling
- Supports file uploads via `multer` and Cloudinary integration.
- Uses `zod` for input validation.

## Key Features

### Authentication

- User registration and login.
- Protected profile endpoints under `/api/v1/auth/me`.
- Password reset via token endpoint.
- Logout endpoint.

### Product Management

- Public product listing and single-product details.
- Filtering, searching, and pagination for product lists.
- Reviews: create, list, and delete reviews.
- Admin/manager product CRUD with image upload support.

### Orders & Payment

- Order creation and management routes.
- Payment processing integration under `/api/v1/payment`.
- Manual transfer payments for Myanmar (KPay, AYA Pay, Wave Money, UAB Pay, CB Pay, etc.) with account information displayed on the checkout payment page.
- Admin can update manual transfer account info from the admin dashboard (stored in DB, not hard-coded).
- Admin analytics and order administration capabilities.

### Administration

- Protected admin routes under `/api/v1/admin`.
- Role-based authorization supporting `admin` and `manager` roles.
- Product and order management features for administrators.

## API Endpoints

Base path: `/api/v1`

- `/auth` — authentication, registration, password reset, logout, profile
- `/products` — product listing, single product, reviews, admin product CRUD
- `/orders` — order creation and retrieval
- `/payment` — payment checkout and webhook handling
- `/admin` — admin-specific analytics and management endpoints

Additional payment-related endpoints:

- `GET /payment/manual-info` — public manual transfer account information for checkout UI
- `GET /admin/manual-payment` — get manual transfer settings (admin)
- `PUT /admin/manual-payment` — update manual transfer settings (admin)

## Important Files

### Frontend

- `client/src/App.tsx` — application router and top-level provider setup
- `client/src/components/layout/MainLayout.tsx` — main application frame
- `client/src/features/auth/pages/Login.tsx` and `Register.tsx`
- `client/src/features/products/pages/ProductDetails.tsx`
- `client/src/features/cart/CartScreen.tsx`, `ShippingScreen.tsx`
- `client/src/app/store.ts` — Redux store configuration
- `client/src/services/apiSlice.ts` — API service layer

### Backend

- `server/src/app.ts` — Express application bootstrap
- `server/src/config/db.config.ts` — database connection logic
- `server/src/routes/*.ts` — route declarations for auth, products, orders, payment, admin
- `server/src/controllers/*.ts` — business logic for each domain
- `server/src/middlewares/*.ts` — authentication, error handling, rate limiting, file upload, validation
- `server/src/utils/*.ts` — JWT, email, error handling, API feature utilities

## Technology Stack

### Client

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- react-hook-form
- Sonner notifications

### Server

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Passport Google OAuth
- Cloudinary file uploads
- Payment integration
- Zod validation

## Development Commands

From repository root:

- `npm run dev` — start both client and server concurrently
- `npm run start:client` — start client only
- `npm run start:server` — start server only

Frontend commands (client):

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — lint client code
- `npm run preview` — preview built client

Backend commands (server):

- `npm run dev` — start server in development with `ts-node-dev`
- `npm run build` — compile backend TypeScript
- `npm run start` — run compiled server
- `npm run seed` — run seeder script
- `npm run lint` — lint backend code
- `npm run lint:fix` — autofix lint issues

## Deployment Notes

- Ensure environment variables are configured for MongoDB, Cloudinary, JWT secrets, and client origin.
- The backend listens on port `5000` by default.
- CORS is configured to allow `http://localhost:5173`.
- The client is served separately via Vite in development.

## Goals & Scope

LaptopVerse is designed to be a full-featured laptop marketplace with:

- product discovery and rich search/filter capabilities
- user authentication and profile management
- cart and checkout workflows
- admin management for products, orders, and analytics
- secure production-ready backend behavior

## Notes

- The codebase is organized into frontend and backend apps to keep concerns separated.
- The backend implements strong validation, error handling, and rate limiting to protect the API.
- The frontend uses feature-based structure for modular growth and easier maintenance.
