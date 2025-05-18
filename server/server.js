import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import dbConnect from "./db/dbConnect.js";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();

//default middlewares
app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "url",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// api endpoints
app.get("/api", (req, res) => {
  res.send("API is running");
});
// db connection
dbConnect();

app.listen(PORT, () => {
  console.log(`Server running on the PORT ${PORT} :)`);
});
