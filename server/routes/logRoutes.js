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

router.get("/previous/:workoutId", async (req, res) => {
  const userId = req.user.id;
  const workoutId = req.params.workoutId;

  try {
    const result = await pool.query(
      `
        SELECT wle.*
        FROM workout_log_exercises wle
        WHERE wle.log_id = (
          SELECT wl.log_id
          FROM workout_logs wl
          WHERE wl.user_id = $1 AND wl.workout_id = $2
          ORDER BY wl.completed_at DESC
          LIMIT 1
        )
      `,
      [userId, workoutId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(
      "Something went wrong fetching previous workout:",
      err.message
    );
    res.status(500).json({ message: "Failed to fetch previous workout." });
  }
});

router.get("/history/:splitId", async (req, res) => {
  const userId = req.user.id;
  const splitId = req.params.splitId;

  try {
    const result = await pool.query(
      `
        SELECT
          wl.log_id,
          wl.completed_at,
          w.name AS workout_name
        FROM workout_logs wl
        JOIN workouts w ON wl.workout_id = w.workout_id
        WHERE wl.user_id = $1 AND w.split_id = $2
        ORDER BY wl.completed_at DESC
      `,
      [userId, splitId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Could not fetch log history:", err.message);
    res.status(500).json({ message: "Could not fetch log history" });
  }
});

router.get("/log-history-specific/:logId", async (req, res) => {
  const userId = req.user.id;
  const logId = req.params.logId;

  try {
    const response = await pool.query(
      `
        SELECT *
        FROM workout_log_exercises
        WHERE log_id = $1
        ORDER BY exercise_id, set_number ASC;
      `,
      [logId]
    );

    res.json(response.rows);
  } catch (error) {
    console.error(err.message);
    res
      .status(500)
      .json({ message: "Something went wrong fetching the log data" });
  }
});

export default router;
