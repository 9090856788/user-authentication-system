# User Authentication System with Admin Panel

A production-grade, full-stack user authentication platform with a comprehensive Administrator Dashboard built with **React + Vite**, **Redux Toolkit**, **TanStack Query**, **React Router v7**, **React Hook Form + Zod**, **Lucide Icons**, and an **Express 5 + MongoDB** backend.

---

## 🚀 Key Features

### 1. Complete Public Authentication Flows
- **Landing Page**: Modern hero section, key capability cards, navigation, theme toggle, and call-to-actions.
- **Registration**: Full form with real-time Zod validation (full name, username, email, phone, secure password), anti-bot checks, and automated verification OTP dispatch.
- **Login**: Flexible login via email or username, password visibility toggle, session persistence, and error feedback.
- **OTP Account Verification**: 6-box segmented OTP input with auto-advance, backspace navigation, paste handling, and 30-second cooldown timer.
- **Forgot Password Flow**: Email/phone OTP request, OTP verification, and reset password screen with real-time password strength meter and celebration success state.
- **Session Lifecycle**: 15-minute JWT access tokens + 7-day secure HttpOnly refresh token with automatic silent refresh and session-expiry interceptor.

### 2. User Dashboard & Account Management
- **Dashboard Overview**: Personalized greeting, account verification banner with one-click verification modal, profile summary card, and quick navigation.
- **Profile Overview & Edit**: Initials avatar fallback, full contact and personal details display, and edit modal with server-side field whitelisting.
- **Settings & Security**:
  - Live Theme Toggle (Light / Dark mode persisted to Redux and `localStorage`).
  - Change Password with current password verification and strength constraints.
  - Destructive Account Deletion with safety confirmation modal and session destruction.

### 3. Administrator Dashboard & Management Panel
- **Real-Time Statistics**: Total registered users, verified users, unverified accounts, active vs. suspended counts, and admin distribution calculated directly from server queries.
- **Searchable & Paginated User Directory**:
  - Full-text search by name, username, or email.
  - Multi-attribute filtering (Role: `admin` | `user`, Status: `active` | `suspended`, Verification: `verified` | `unverified`).
  - Safe multi-column sorting (`createdAt`, `fullName`, `email`, `role`, `accountStatus`) and adjustable page limits (10, 25, 50).
- **User Actions**:
  - View detailed user inspect modal or dedicated route (`/admin/users/:id`).
  - Edit permitted fields (Full Name, Phone, Account Status).
  - Role management (Promote to `admin` / Demote to `user`) with role change confirmation modal.
  - Account suspension and reactivation.
  - Destructive account deletion with confirmation.
- **Admin Lockout Protections**:
  - Prevents an active administrator from self-suspending or self-deleting to avoid accidental lockouts.
  - Prevents demoting or deleting the last active system administrator.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, Vite, Plain CSS with design tokens (`variables.css`, `global.css`, `components.css`) |
| **Client State** | Redux Toolkit (`@reduxjs/toolkit`), React Redux (Zero React Context API) |
| **Server State & Cache** | TanStack Query (`@tanstack/react-query`) with automatic query invalidation |
| **Routing** | React Router v7 (`react-router-dom`) with `ProtectedRoute`, `AdminRoute`, and `PublicOnlyRoute` |
| **Forms & Validation** | React Hook Form, `@hookform/resolvers/zod`, Zod schema validations |
| **Icons** | Lucide React (`lucide-react`) |
| **Backend API** | Node.js, Express 5, CORS, Cookie-Parser, Express-Rate-Limit |
| **Database** | MongoDB / Mongoose |
| **Authentication** | JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), HttpOnly Cookies |
| **API Documentation** | Swagger UI Express (`swagger-ui-express`) with interactive OpenAPI 3.0 specs |
| **Testing** | Node 22 native test runner (`node --test`) |

---

## 📦 Default Credentials & Seeding

The application initializes with an administrative account ready for testing and administrative actions:

| Credential | Value |
|---|---|
| **Admin Email** | `admin@example.com` |
| **Admin Username** | `admin` |
| **Admin Password** | `AdminPassword123!` |
| **Role** | `admin` |
| **Status** | `active` (verified) |

To provision or re-seed an administrator via CLI:
```bash
npm --prefix server run seed:admin
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
# Install workspace dependencies
npm install
```

### 2. Environment Variables
Copy `.env.example` to `server/.env` and configure appropriate secrets:
```bash
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/user-auth
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_min_32_chars
EMAIL_SERVICE=Gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Run the Applet
```bash
# Build client and run server
npm run build
npm start
```

### 4. Run Tests
```bash
# Run unit & integration test suites
npm test
```

---

## 📚 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in with email or username
- `GET /api/auth/logout` — Invalidate session and clear cookies
- `GET /api/auth/refresh-token` — Silent access token refresh via HttpOnly cookie
- `POST /api/auth/request-password-reset` — Request password reset OTP
- `POST /api/auth/verify-reset-otp` — Validate reset OTP code
- `POST /api/auth/reset-password` — Set new password with OTP token

### User Management (`/api/user`)
- `GET /api/user/me` — Retrieve authenticated user profile
- `PUT /api/user/update` — Update whitelisted profile fields
- `POST /api/user/change-password` — Change password with current password verification
- `DELETE /api/user/delete` — Delete authenticated account
- `GET /api/user/send-otp` — Request verification OTP
- `POST /api/user/verify-otp` — Verify account with OTP code

### Admin Management (`/api/admin`) *(Requires `role: admin`)*
- `GET /api/admin/dashboard/stats` — Overall counts, verification rates, and recent users
- `GET /api/admin/users` — Paginated user directory with search, filter, and sort
- `GET /api/admin/users/:id` — Inspect individual user details
- `PATCH /api/admin/users/:id` — Edit allowed user profile fields
- `PATCH /api/admin/users/:id/role` — Promote or demote user role
- `PATCH /api/admin/users/:id/status` — Suspend or reactivate user account
- `DELETE /api/admin/users/:id` — Delete user account

### System & Documentation
- `GET /api/health` — Service health, uptime, and system status
- `GET /api/docs` — Interactive Swagger UI OpenAPI documentation
