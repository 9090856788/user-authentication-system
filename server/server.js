import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger.js";
import dbConnect from "./db/dbConnect.js";
import { errorMiddleware } from "./middlewares/error.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

// Trust reverse proxy headers (Cloud Run, load balancers, reverse proxies)
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Apply general rate limiting to all incoming API traffic
app.use("/api", generalLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: "User Authentication System",
    environment: process.env.NODE_ENV || "development",
  });
});

// Interactive Swagger OpenAPI Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route handlers
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// Static client bundle delivery
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Global error handler
app.use(errorMiddleware);

// Single Page Application fallback for non-API routes
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }

  const indexPath = path.join(clientDistPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>User Auth System</title></head>
      <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h2>User Authentication System API is active</h2>
        <p><a href="/api/docs">View API Documentation (Swagger)</a></p>
      </body>
    </html>
  `);
});

dbConnect();

try {
  removeUnverifiedAccounts();
} catch (e) {
  console.warn("Scheduler note:", e.message);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  console.log(`Swagger docs available at http://0.0.0.0:${PORT}/api/docs`);
});
