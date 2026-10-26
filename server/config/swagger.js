export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "User Authentication System API",
    version: "1.0.0",
    description: "RESTful API documentation for JWT authentication, email OTP verification, user profile management, and password recovery.",
  },
  servers: [
    {
      url: "/",
      description: "Local / Production Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Pass JWT Access Token obtained from /api/auth/login or /api/auth/register",
      },
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description: "HTTP-only cookie containing refresh token",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          uptime: { type: "number", example: 120 },
          timestamp: { type: "string", example: "2026-10-26T10:00:00.000Z" },
          service: { type: "string", example: "User Authentication System" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "username", "email", "password"],
        properties: {
          fullName: { type: "string", example: "Alice Johnson" },
          username: { type: "string", example: "alice_johnson" },
          email: { type: "string", format: "email", example: "alice@example.com" },
          password: { type: "string", format: "password", minLength: 8, example: "SecretPassword123" },
          phoneNumber: { type: "string", example: "+1234567890" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["emailOrUsername", "password"],
        properties: {
          emailOrUsername: { type: "string", example: "alice@example.com" },
          password: { type: "string", format: "password", example: "SecretPassword123" },
        },
      },
      PasswordResetRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "alice@example.com" },
        },
      },
      VerifyResetOTPRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "alice@example.com" },
          otp: { type: "string", example: "123456" },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "newPassword"],
        properties: {
          email: { type: "string", format: "email", example: "alice@example.com" },
          otp: { type: "string", example: "123456" },
          newPassword: { type: "string", format: "password", minLength: 8, example: "NewSecurePassword123" },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Alice J. Smith" },
          phoneNumber: { type: "string", example: "+1987654321" },
          gender: { type: "string", enum: ["male", "female", "other"], example: "female" },
          bio: { type: "string", example: "Full-stack software engineer." },
          preferences: {
            type: "object",
            properties: {
              theme: { type: "string", example: "dark" },
              notifications: { type: "boolean", example: true },
            },
          },
        },
      },
      VerifyAccountOTPRequest: {
        type: "object",
        required: ["otp"],
        properties: {
          otp: { type: "string", example: "123456" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        summary: "Service Health Check",
        description: "Returns current status, uptime, and system metadata.",
        tags: ["System"],
        responses: {
          200: {
            description: "Service is operational",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register new user account",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Missing or invalid fields" },
          409: { description: "User with this email or username already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Log in with email/username and password",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful, sets refresh token cookie" },
          401: { description: "Invalid credentials" },
          403: { description: "Account suspended" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Log out user and clear refresh token cookie",
        tags: ["Authentication"],
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
      get: {
        summary: "Log out user (GET fallback)",
        tags: ["Authentication"],
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/api/auth/refresh-token": {
      get: {
        summary: "Refresh access token using HTTP-only cookie",
        tags: ["Authentication"],
        security: [{ CookieAuth: [] }],
        responses: {
          200: { description: "Returns new access token" },
          401: { description: "Missing or invalid refresh token" },
        },
      },
    },
    "/api/auth/request-password-reset": {
      post: {
        summary: "Send password reset OTP code to registered email",
        tags: ["Password Recovery"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordResetRequest" },
            },
          },
        },
        responses: {
          200: { description: "OTP code sent if email exists" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/auth/verify-reset-otp": {
      post: {
        summary: "Verify password reset OTP code",
        tags: ["Password Recovery"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyResetOTPRequest" },
            },
          },
        },
        responses: {
          200: { description: "OTP verified successfully" },
          400: { description: "Invalid or expired OTP code" },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        summary: "Reset user password with valid OTP code",
        tags: ["Password Recovery"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password reset successfully" },
          400: { description: "Invalid OTP or weak password" },
        },
      },
    },
    "/api/user/update": {
      put: {
        summary: "Update profile of authenticated user",
        tags: ["User Profile"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" },
            },
          },
        },
        responses: {
          200: { description: "Profile updated successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/user/delete": {
      delete: {
        summary: "Delete authenticated user account",
        tags: ["User Profile"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "User deleted successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/user/send-otp": {
      get: {
        summary: "Send account verification OTP to user email",
        tags: ["User Verification"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Verification OTP code sent" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/user/verify-otp": {
      post: {
        summary: "Verify user account with OTP code",
        tags: ["User Verification"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyAccountOTPRequest" },
            },
          },
        },
        responses: {
          200: { description: "Account verified successfully" },
          400: { description: "Invalid or expired OTP code" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};
