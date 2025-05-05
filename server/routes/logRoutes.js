import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/workout/:splitId", async (req, res) => {
  const { name, workoutId, setsData, notes, exerciseIds } = req.body;
  const splitId = req.params.splitId;
  const userId = req.user.id;
  try {
    await pool.query("BEGIN");

    const check = await pool.query(
      `
        SELECT * FROM workout_splits WHERE split_id = $1 AND user_id = $2
      `,
      [splitId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized to log workout." });
    }
  } catch (err) {
    console.error("Something went wrong:", err.message);
    res.status(500).json({ "Error logging workout": err.message });
  }
});

export default router;
