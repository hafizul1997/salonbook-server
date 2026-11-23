# SalonBook – Backend Server

SalonBook is a salon appointment booking platform. This repository contains the backend REST API built with Node.js, Express.js, TypeScript, MongoDB, and Better Auth.

## Live Deployment

- **Backend API:** https://salonbook-server-9hvv.onrender.com
- **API Base URL:** https://salonbook-server-9hvv.onrender.com/api
- **Frontend:** https://salonbook-client-5blk.vercel.app
- **Client Repository:** https://github.com/hafizul1997/salonbook-client
- **Server Repository:** https://github.com/hafizul1997/salonbook-server

## Features

### Authentication and Authorization
- Email and password registration and login.
- Google OAuth login using Better Auth.
- JWT authentication.
- Role-based authorization for Admin and Customer.
- Protected routes.
- Admin can block customers.

### Customer Features
- View available salon services.
- Book salon appointments.
- Cancel appointments.
- View appointment status.
- Prevent duplicate bookings for the same date and time slot.

### Admin Features
- Access the admin dashboard.
- Add and manage salon services.
- View customer appointments.
- Confirm appointments.
- Cancel appointments.
- View appointment statuses.
- Block customers.
- Admin accounts cannot book customer appointments.

### Payment
- Stripe payment integration.
- Payment status management.
- Stripe webhook integration for payment event handling.

### Other Features
- MongoDB database integration.
- Image upload using ImgBB.
- REST API architecture.
- Environment variable configuration.
- CORS configuration.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Better Auth
- JWT
- Stripe
- ImgBB
- dotenv
- CORS

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hafizul1997/salonbook-server.git
```

### 2. Navigate to the Project Directory

```bash
cd salonbook-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

Add the following environment variables with your own credentials:

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

**Important:** Never upload your `.env` file or expose your private API keys, database credentials, OAuth secrets, or Stripe secrets on GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:5000
```

### 6. Build the Project

```bash
npm run build
```

### 7. Start the Production Server

```bash
npm run start
```

## API Configuration

The API base URL for local development is:

```text
http://localhost:5000/api
```

The production API base URL is:

```text
https://salonbook-server-9hvv.onrender.com/api
```

## Authentication

SalonBook uses Better Auth for authentication.

Supported authentication methods:

- Email and password.
- Google OAuth.

Authentication and authorization protect private routes and restrict access based on user roles.

**Customer:** Can book and cancel appointments.

**Admin:** Can manage services, appointments, and customers.

## Appointment Booking

The appointment system allows customers to select a service, date, and time slot.

The backend checks for existing active appointments to prevent duplicate bookings for the same date and time.

Customers can cancel their appointments. Admins can confirm or cancel appointments.

## Payment Integration

Stripe is used to process payments.

The backend handles payment-related operations and provides a webhook endpoint for Stripe payment events.

Webhook endpoint:

```text
https://salonbook-server-9hvv.onrender.com/api/webhooks/stripe
```

Configure the webhook signing secret in the server environment before using production webhook verification.

## Deployment

The backend is deployed on **Render**.

- Build Command:

```bash
npm install && npm run build
```

- Start Command:

```bash
npm run start
```

Production backend:

https://salonbook-server-9hvv.onrender.com

## Project Structure

```text
salonbook-server/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Security

- Environment variables are used for sensitive configuration.
- Authentication is handled through Better Auth.
- Protected API routes require authentication.
- Role-based authorization restricts admin-only operations.
- Customers cannot access admin-only features.
- CORS is configured for trusted frontend origins.

## Current Project Status

- Backend deployed successfully on Render.
- MongoDB connection working.
- Email and password authentication tested with a new account.
- Google login tested for Admin and Customer.
- Admin service management tested.
- Admin appointment confirmation and cancellation tested.
- Customer appointment booking and cancellation tested.
- Duplicate date and time slot booking prevention tested.
- Admin appointment booking restricted.

**Remaining verification:**
- An older customer account has a production sign-in issue that still needs investigation.
- Production Stripe webhook delivery and payment event handling still need final verification.

## Author

**SalonBook Project**

GitHub: https://github.com/hafizul1997