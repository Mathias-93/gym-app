import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/user_prs", async (req, res) => {
  userId = req.user.id;

  try {
    const userPrsRes = await pool.query(
      `
            SELECT pr_type, value, exercise_id, achieved_at FROM prs 
            WHERE user_id = $1
        `,
      [userId]
    );

    res.status(200).json(userPrsRes);
  } catch (err) {
    console.err(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
