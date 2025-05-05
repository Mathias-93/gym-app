import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/workout/:splitId", async (req, res) => {
  const { exerciseNamesList, workoutId, setsData, notes, exerciseIdsList } =
    req.body;
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
      await pool.query("ROLLBACK");
      return res.status(403).json({ message: "Unauthorized to log workout." });
    }

    const result = await pool.query(
      `
        INSERT INTO workout_logs (user_id, workout_id)
        VALUES ($1, $2)
        RETURNING log_id
      `,
      [userId, workoutId]
    );

    const logId = result.rows[0].log_id;

    for (let i = 0; i < exerciseIdsList.length; i++) {
      const exerciseId = exerciseIdsList[i];
      const setsForThisExercise = setsData[i];
      const notesForThisExercise = notes;

      for (const set of setsForThisExercise) {
        const { reps, weight } = set;

        await pool.query(
          `
          INSERT INTO workout_log_exercises (log_id, exercise_id, sets, reps, weight, notes, exercise_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            logId,
            exerciseId,
            setsForThisExercise.length,
            reps,
            weight,
            notesForThisExercise,
          ]
        );
      }
    }

    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Something went wrong:", err.message);
    res.status(500).json({ "Error logging workout": err.message });
  }
});

export default router;
