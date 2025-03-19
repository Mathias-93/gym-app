import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const exercises = await pool.query("SELECT * FROM exercises");
    res.status(200).json(exercises.rows);
  } catch (err) {
    console.error("Error fetching exercises", err.message);
    res.status(500).json({ "Error fetching exercises": err.message });
  }
});

export default router;
