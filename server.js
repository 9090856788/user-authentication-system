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
app.use(cookieParser());
app.use(cors({
    origin: "url",
    credentials: true
}));

// api endpoints

// db connection
dbConnect();


app.get("/", (req,res) => {
    res.send("Api working")
})
app.listen(PORT, () => {
    console.log(`Server running on the PORT ${PORT} ):`)
})