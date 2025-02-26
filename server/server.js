import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";

const PORT = 1337;
const app = express();

app.use(cors());
app.use(express.json());

// Any api requests that has to do with registration and login
app.use("/auth", authRoutes);
// Any api requests that has to do with splits and plans
app.use("/plan", planRoutes);
// Any api requests that has to do with fetching exercises
app.use("/exercises", exerciseRoutes);

app.get("/", async (req, res) => {
  try {
    // Loading front end
    console.log("Hello");
    res.status(200).json({ message: "Yo" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.status(200).json(allUsers.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
