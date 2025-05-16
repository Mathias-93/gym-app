import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/user_prs", async (req, res) => {
  const userId = req.user.id;

  try {
    const userPrsRes = await pool.query(
      `
            SELECT pr_type, value, exercise_id, achieved_at FROM prs 
            WHERE user_id = $1
        `,
      [userId]
    );

    res.status(200).json(userPrsRes.rows);
  } catch (err) {
    console.err(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/volume_pr_data", async (req, res) => {
  const userId = req.user.id;
  const { exerciseId } = req.body;

  try {
    const check = await pool.query(
      `
        SELECT * FROM workout_logs WHERE user_id = $1
      `,
      [userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized to see PR data." });
    }

    const prData = await pool.query(
      `
        SELECT exercise_name, reps, weight FROM workout_log_exercises
        WHERE exercise_id = $1
      `,
      [exerciseId]
    );
    res.status(200).json(prData.rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong when fetching volume PR" });
  }
});

export default router;
