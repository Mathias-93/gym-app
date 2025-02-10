import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";

const PORT = 1337;
const app = express();

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PW:", process.env.DB_PW);
console.log("DB_NAME:", process.env.DB_NAME);

app.use(cors());
app.use(express.json());

// Any api request to the /auth route will go through here
app.use("/auth", authRoutes);
// Any api request to the /plan route will go through here
app.use("/plan", planRoutes);

app.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.status(200).json(allUsers.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

app.get("/workout_splits", async (req, res) => {
  try {
    const allSplits = await pool.query("SELECT * FROM workout_splits");
    res.status(200).json(allSplits.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

app.get("/workouts", async (req, res) => {
  try {
    const allworkouts = await pool.query("SELECT * FROM workouts");
    res.status(200).json(allworkouts.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
