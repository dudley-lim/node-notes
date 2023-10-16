import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/userRoutes.js";
import noteRoutes from "./src/routes/noteRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/notes", noteRoutes);

export default app;