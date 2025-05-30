import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import dbConnect from "./db/dbConnect.js";
import { errorMiddleware } from "./middlewares/error.js";

// Import route files
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();

// ✅ Default middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ API health check
app.get("/api", (req, res) => {
  res;
});

// ✅ Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ✅ Connect to database
dbConnect();

// ✅ Global error handler
app.use(errorMiddleware);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on the PORT ${PORT} :)`);
});
