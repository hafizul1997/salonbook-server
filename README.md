# SalonBook – Backend API

**SalonBook** is a salon appointment booking platform backend built with Node.js, Express.js, TypeScript, MongoDB, and Better Auth. It provides secure authentication, role-based authorization, service management, appointment booking, Stripe payments, transaction management, and image uploads.

## Live Deployment

- **Backend API:** https://salonbook-server-z4k4.onrender.com
- **Frontend Application:** https://salonbook-client-5blk.vercel.app

## Features

- User authentication with email and password.
- Google OAuth authentication.
- JWT-based API authentication.
- Role-based access control (Admin and Customer).
- Admin dashboard API support.
- Salon service creation, updating, and deletion.
- Customer appointment booking and cancellation.
- Admin appointment confirmation and management.
- Stripe Checkout payment integration.
- Stripe webhook payment verification.
- Transaction management.
- Image uploads using ImgBB.
- Customer profile management.
- Admin customer management and account blocking.
- MongoDB database integration.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | Backend framework |
| TypeScript | Type-safe development |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| Better Auth | Authentication |
| JWT / JOSE | Token verification |
| Google OAuth | Social authentication |
| Stripe | Payment processing |
| Multer | File upload handling |
| ImgBB | Image hosting |
| Zod | Data validation |

## Project Structure

```text
salonbook-server/
│
├── src/
│   ├── config/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── mongo.ts
│   │   └── stripe.ts
│   │
│   ├── controllers/
│   │   ├── appointment.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── service.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── user.controller.ts
│   │   └── webhook.controller.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── upload.middleware.ts
│   │
│   ├── models/
│   │   ├── appointment.model.ts
│   │   ├── service.model.ts
│   │   └── transaction.model.ts
│   │
│   ├── routes/
│   │   ├── appointment.routes.ts
│   │   ├── health.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── service.routes.ts
│   │   ├── test.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── user.routes.ts
│   │   └── webhook.routes.ts
│   │
│   ├── scripts/
│   │   └── set-admin.ts
│   │
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_SERVER_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project

```bash
cd salonbook-server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_better_auth_secret

TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

IMGBB_API_KEY=your_imgbb_api_key
```

**Important:** Replace all placeholder values with your own credentials. Never commit your `.env` file or expose API keys and secrets publicly.

## Running the Project

### Development mode

```bash
npm run dev
```

The development server runs at:

```text
http://localhost:5000
```

### Production build

```bash
npm run build
```

### Start production server

```bash
npm start
```

## API Documentation

Base URL:

```text
https://salonbook-server-z4k4.onrender.com
```

API prefix:

```text
/api
```

### 1. Health Check

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | Public |

Checks whether the backend API is running.

### 2. Authentication

Better Auth handles authentication endpoints under:

```text
/api/auth
```

Supported authentication features:

- Email and password registration.
- Email and password login.
- Google OAuth login.
- Session management.
- JWT token generation.

### 3. Services

Base endpoint: `/api/services`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/services` | Public |
| POST | `/api/services` | Admin |
| GET | `/api/services/admin/all` | Admin |
| PATCH | `/api/services/:id` | Admin |
| DELETE | `/api/services/:id` | Admin |

### 4. Appointments

Base endpoint: `/api/appointments`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/appointments` | Customer |
| GET | `/api/appointments/my` | Customer |
| PATCH | `/api/appointments/:id/cancel` | Customer |
| GET | `/api/appointments/admin/all` | Admin |
| PATCH | `/api/appointments/admin/:id/confirm` | Admin |
| PATCH | `/api/appointments/admin/:id/cancel` | Admin |

### 5. Users

Base endpoint: `/api/users`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users` | Admin |
| PATCH | `/api/users/:id/block` | Admin |
| GET | `/api/users/me` | Customer / Admin |
| PATCH | `/api/users/me/profile` | Customer / Admin |
| POST | `/api/users/admin/set-password` | Admin |

### 6. Payments

Base endpoint: `/api/payments`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/payments/create-checkout-session` | Customer |

Stripe Checkout is used to process appointment payments.

### 7. Transactions

Base endpoint: `/api/transactions`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/transactions` | Admin |

### 8. Image Uploads

Base endpoint: `/api/uploads`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/uploads/image` | Customer / Admin |

Uses `multipart/form-data` with the field name `image`.

### 9. Stripe Webhook

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/webhooks/stripe` | Stripe signature verification |

Supported events:

- `checkout.session.completed`
- `checkout.session.async_payment_failed`

Webhook signatures are verified before processing payment events.

### 10. Test Routes

Base endpoint: `/api/test`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/test/protected` | Authenticated user |
| GET | `/api/test/admin-only` | Admin |

## Authentication and Authorization

SalonBook uses Better Auth for user authentication and JWT for protecting backend API routes.

- Authenticated users receive JWT tokens.
- Protected requests use the `Authorization` header.
- Admin-only endpoints require the Admin role.
- Customer-only endpoints require the Customer role.
- Blocked accounts cannot access protected resources.

Example request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database

MongoDB is used as the primary database.

Mongoose manages application data models, including:

- Appointments
- Services
- Transactions

Better Auth uses the MongoDB adapter for authentication-related data.

## Payment Integration

Stripe Checkout is integrated for secure online appointment payments.

Payment workflow:

1. Customer creates an appointment.
2. Admin confirms the appointment.
3. Customer initiates payment.
4. Backend creates a Stripe Checkout Session.
5. Customer completes payment through Stripe.
6. Stripe sends a webhook event.
7. Backend verifies the webhook signature.
8. Payment and transaction records are updated.

## Deployment

The backend is deployed using **Render**.

Production API:

https://salonbook-server-z4k4.onrender.com

For production deployment, configure the required environment variables in Render:

- `PORT`
- `MONGODB_URI`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `TRUSTED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `IMGBB_API_KEY`

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

## Git Workflow

The project uses Git and GitHub for version control.

Example:

```bash
git add .
git commit -m "your commit message"
git push origin main
```

## Security Notes

- Environment variables are used for sensitive credentials.
- JWT verification protects private API endpoints.
- Role-based middleware restricts administrative operations.
- Stripe webhook signatures are verified.
- Passwords are handled through Better Auth.
- MongoDB connection credentials must remain private.

## Author

SalonBook Backend – Salon Appointment Booking Platform.

**Project Status:** Deployed and operational.
