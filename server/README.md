# User Authentication System — Server

Simple Express + MongoDB backend that provides JWT-based authentication,
OTP verification (email/SMS), password reset flows, and basic user profile
management.

## Features

- Register / Login with username or email
- JWT access (15m) + refresh token (7d) via secure HttpOnly cookie
- Password reset via OTP (email/SMS)
- Account verification via OTP
- Protected user routes (update / delete / send-otp / verify-otp)
- Periodic cleanup job to remove recently unverified accounts

## Quick Start

1. Install dependencies

```bash
cd server
npm install
```

2. Create a `.env` file in the `server/` folder with the required variables (example below).

3. Run the server (development)

```bash
npm run start
```

Server listens on `PORT` (default: 4000).

## Environment Variables

Create a `.env` file with the following variables:

- `PORT` — optional, server port
- `NODE_ENV` — `development` or `production`
- `MONGO_URI` — MongoDB connection string
- `ACCESS_TOKEN_SECRET` — JWT secret for access tokens (15m)
- `REFRESH_TOKEN_SECRET` — JWT secret for refresh tokens (7d)
- `EMAIL_SERVICE` — nodemailer service (e.g., Gmail)
- `EMAIL_USER` — email account used to send OTPs
- `EMAIL_PASS` — password / app password for `EMAIL_USER`
- `TWILIO_ACCOUNT_SID` — Twilio SID (optional)
- `TWILIO_AUTH_TOKEN` — Twilio auth token (optional)
- `TWILIO_PHONE_NUMBER` — Twilio phone number to send SMS from (optional)

Example `.env` snippet:

```env
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
ACCESS_TOKEN_SECRET=some-secret
REFRESH_TOKEN_SECRET=some-refresh-secret
EMAIL_SERVICE=Gmail
EMAIL_USER=youremail@example.com
EMAIL_PASS=your-email-password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+11234567890
```

## API Endpoints

Base path: `/api`

**Auth** (`/api/auth`)

- `POST /register` — Register a new user
  - Body: `{ fullName, username, email, password, phoneNumber }`
- `POST /login` — Login with email or username
  - Body: `{ emailOrUsername, password }`
  - Response: `{ accessToken }` and `refreshToken` cookie (HttpOnly)
- `GET /logout` — Clears the refresh token cookie
- `GET /refresh-token` — Use `refreshToken` cookie to get new access token
- `POST /request-password-reset` — Send OTP for password reset
  - Body: `{ emailOrPhone }`
- `POST /verify-reset-otp` — Verify OTP for reset
  - Body: `{ emailOrPhone, otp }`
- `POST /reset-password` — Reset password using OTP
  - Body: `{ emailOrPhone, otp, newPassword }`

**User** (`/api/user`) — Protected (require `Authorization: Bearer <accessToken>`)

- `PUT /update` — Update authenticated user's profile
- `DELETE /delete` — Delete authenticated user's account (also clears cookie)
- `GET /send-otp` — Send verification OTP to user's email/phone
- `POST /verify-otp` — Verify account OTP
  - Body: `{ otp }`

## Authentication Details

- Access tokens: signed with `ACCESS_TOKEN_SECRET`, expire in 15 minutes.
- Refresh tokens: signed with `REFRESH_TOKEN_SECRET`, expire in 7 days and
  are stored in an HttpOnly cookie named `refreshToken`.
- Protected routes require an `Authorization` header: `Bearer <accessToken>`.

## Email & SMS (OTP)

- Email: uses `nodemailer` with `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`.
- SMS: uses Twilio; requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and
  `TWILIO_PHONE_NUMBER`.

## Database

- Uses MongoDB via Mongoose. Connection string is read from `MONGO_URI`.

## Background Jobs

- `server/automation/removeUnverifiedAccounts.js` schedules a job (cron)
  that deletes accounts that are not verified and older than 30 minutes.

## Error Handling

- Centralized error middleware in `middlewares/error.js` returns consistent
  JSON error responses and handles mongoose/jwt/multer errors.

## Notes & Recommendations

- OTPs are 6-digit numeric codes and expire after 10 minutes.
- Passwords are hashed with `bcrypt` before saving.
- The default phone formatting assumes Indian numbers (`+91`) — adjust
  `utils/sendSMSOTP.js` if you target other regions.
- For production, set `NODE_ENV=production` and ensure `ACCESS_TOKEN_SECRET`
  and `REFRESH_TOKEN_SECRET` are strong secrets stored securely.

## Testing / Example Requests

Login example (curl):

```bash
curl -X POST http://localhost:4000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"emailOrUsername":"alice","password":"password123"}'
```

Protected request example:

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:4000/api/user/send-otp
```

## Scripts

- `npm run start` — start server with `nodemon` (uses `server.js`)

## License

ISC
