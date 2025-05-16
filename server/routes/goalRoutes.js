import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/user_goals", async (req, res) => {
  const userId = req.user.id;

  try {
    const check = await pool.query(
      `
        SELECT * FROM workout_logs WHERE user_id = $1
      `,
      [userId]
    );

    if (check.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized to see goals data." });
    }

    const userGoals = await pool.query(
      `
            SELECT exercise_id, goal_type, target_value, current_value, is_completed, created_at, completed_at FROM goals
            WHERE user_id = $1
        `,
      [userId]
    );
    res.status(200).json(userGoals.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
