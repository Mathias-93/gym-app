import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import prRoutes from "./routes/prRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import authenticateToken from "./middleware/authMiddleware.js";

const PORT = process.env.PORT || 1337;
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Any api requests that has to do with registration and login
app.use("/auth", authRoutes);

// Any api requests that has to do with splits and plans
app.use("/plan", authenticateToken, planRoutes);

// Any api requests that has to do with fetching exercises
app.use("/exercises", authenticateToken, exerciseRoutes);

// Any api requests that has to do with logging workouts
app.use("/log", authenticateToken, logRoutes);

// Any api requests that has to do with PR's
app.use("/prs", authenticateToken, prRoutes);

// Any api requests that has to do with goals
app.use("/goals", authenticateToken, goalRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
