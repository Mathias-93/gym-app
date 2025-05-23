import express from "express";
import pool from "../db.js";

const router = express.Router();

// Route for fetching user goals
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
            SELECT exercise_id, goal_type, goal_id, target_value, current_value, is_completed, created_at, completed_at, custom_goal_description FROM goals
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

// Route for creating user goals
router.post("/create_goal", async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    goal_type,
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
        return res
          .status(409)
          .json({ message: `This goal is already achieved!` });
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

// Toggle custom goal complete
router.post("/update_custom_goal/:goalId", async (req, res) => {
  const userId = req.user.id;
  const goalId = req.params.goalId;
  const { isCompleted } = req.body;

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
        .json({ message: "Unauthorized to edit goals for this user." });
    }

    await pool.query(
      `
        UPDATE goals 
        SET is_completed = $1, completed_at = CURRENT_TIMESTAMP 
        WHERE user_id = $2 AND goal_id = $3
      `,
      [isCompleted, userId, goalId]
    );
    await pool.query("COMMIT");
    res.status(200).json({ message: "Successfully set goal to completed!" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err.message);
    res.status(400).json({ message: "Could not update goal" });
  }
});

// Route for deleting user goals
router.delete("/delete_goal/:goalId", async (req, res) => {
  const userId = req.user.id;
  const goalId = req.params.goalId;

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

    // Delete goal based on goal_id and user_id
    const result = await pool.query(
      `DELETE FROM goals WHERE user_id = $1 AND goal_id = $2 RETURNING *`,
      [userId, goalId]
    );

    if (result.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "No matching goal found to delete." });
    }
    await pool.query("COMMIT");
    res.status(200).json({
      message: "Goal successfully deleted!",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err.message);
    res.status(400).json({ message: "Could not delete goal" });
  }
});

export default router;
