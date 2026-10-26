# User Authentication System — Server

Express 5 + MongoDB backend providing JWT-based authentication, Nodemailer OTP verification, password reset flows, user profile management, rate limiting, and a secure Admin Management suite.

---

## Features

- **Express 5 REST API** with centralized error handling and rate-limiting (`express-rate-limit`).
- **JWT Architecture**: 15m access token + 7d refresh token in `HttpOnly`, `SameSite: strict` cookie.
- **Nodemailer OTP**: 6-digit numeric OTP generation for account verification and password resets.
- **User Profile Management**: Whitelisted updates, secure password change, account deletion.
- **Admin Management API**: Server-side role checks (`requireAdmin`), stats aggregation, paginated search, role promotion/demotion, account suspension/reactivation, and self-lockout protections.
- **Interactive OpenAPI 3.0 Documentation**: Available at `/api/docs`.
- **Automated Health Check**: Available at `/api/health`.
- **Database Support**: Connects directly to MongoDB via Mongoose using `MONGO_URI`.
- **Automated Test Suite**: Tested using Node.js 22 native test runner (`node --test`).

---

## Environment Variables

See `.env.example` in the workspace root for all environment variables:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening server port | `3000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB connection URI | Required |
| `ACCESS_TOKEN_SECRET` | Secret key for JWT access token (15m) | Required |
| `REFRESH_TOKEN_SECRET` | Secret key for JWT refresh token (7d) | Required |
| `EMAIL_SERVICE` | Nodemailer service provider (e.g. `Gmail`) | Optional |
| `EMAIL_USER` | Email username for sending OTPs | Optional |
| `EMAIL_PASS` | Password or App Password for email account | Optional |

---

## Seed Administrator

A default administrator is automatically created for evaluation:
- **Email:** `admin@example.com`
- **Username:** `admin`
- **Password:** `AdminPassword123!`
- **Role:** `admin`

To manually run the seed script:
```bash
npm run seed:admin
```

---

## API Summary

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh-token`, `/api/auth/request-password-reset`, `/api/auth/verify-reset-otp`, `/api/auth/reset-password`
- **User**: `/api/user/me`, `/api/user/update`, `/api/user/change-password`, `/api/user/delete`, `/api/user/send-otp`, `/api/user/verify-otp`
- **Admin**: `/api/admin/dashboard/stats`, `/api/admin/users`, `/api/admin/users/:id`, `/api/admin/users/:id/role`, `/api/admin/users/:id/status`, `/api/admin/users/:id`
- **Docs & Health**: `/api/docs`, `/api/health`
