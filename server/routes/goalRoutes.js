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

router.post("/create_goal", async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    goal_type,
    selected_exercise_name,
    selected_exercise_id,
    target_value,
    custom_goal_description,
  } = req.body;

  try {
    await pool.query("BEGIN");
    const check = await pool.query(
      `
        SELECT * FROM workout_logs WHERE user_id = $1
      `,
      [userId]
    );

    // Authorization check
    if (check.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "Unauthorized to add goals to this user." });
    }

    let goalToReturn;

    // Insert data into goal table for 1RM or volume goals
    if (goal_type !== "Custom") {
      // Fetch current number if there is one from PR table
      const currentPr = await pool.query(
        `
        SELECT value FROM prs WHERE user_id = $1 AND exercise_id = $2 AND pr_type = $3
      `,
        [userId, selected_exercise_id, goal_type.toLowerCase()]
      );

      const currentPrValue = currentPr.rows[0]?.value || 0;

      if (currentPrValue > target_value) {
        await pool.query("ROLLBACK");
        console.error("This goal is already achieved!");
        return res.status(409).json({ message: `Could not save goal to db` });
      }

      const result = await pool.query(
        `
        INSERT INTO goals (user_id, exercise_id, goal_type, target_value, current_value, title)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      
      `,
        [
          userId,
          selected_exercise_id,
          goal_type,
          target_value,
          currentPrValue || 0,
          title,
        ]
      );

      goalToReturn = result.rows[0];
    } else {
      // If it's a custom goal insert data relevant to that
      const result = await pool.query(
        `
          INSERT INTO goals (user_id, exercise_id, goal_type, target_value, title, custom_goal_description)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *

        `,
        [userId, null, goal_type, null, title, custom_goal_description]
      );

      goalToReturn = result.rows[0];
    }

    await pool.query("COMMIT");
    res.status(200).json({
      message: "Goal successfully saved!",
      goal: goalToReturn,
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err.message);
    res
      .status(500)
      .json({ message: `Could not save goal to db: ${err.message}` });
  }
});

export default router;
