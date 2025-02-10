import express from "express";
const app = express();
import cors from "cors";
const PORT = 1337;
import pool from "./db.js";
import authRoutes from "./routes/authRoutes.js";

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

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
