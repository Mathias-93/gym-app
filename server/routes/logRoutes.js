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
      const notesForThisExercise = notes[i] || null;
      const exerciseName = exerciseNamesList[i];

      for (let j = 0; j < setsForThisExercise.length; j++) {
        const set = setsForThisExercise[j];
        const { reps, weight } = set;
        const setNumber = j + 1;

        await pool.query(
          `
          INSERT INTO workout_log_exercises (log_id, exercise_id, reps, weight, notes, exercise_name, set_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            logId,
            exerciseId,
            reps,
            weight,
            notesForThisExercise,
            exerciseName,
            setNumber,
          ]
        );
      }
    }

    await pool.query("COMMIT");
    res.status(200).json({ message: "Successfully logged exercise!" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Something went wrong:", err.message);
    res.status(500).json({ "Error logging workout": err.message });
  }
});

export default router;
