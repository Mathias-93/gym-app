import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/history/fullHistory", async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
        SELECT
          log_id,
          completed_at,
          workout_name
        FROM workout_logs
        WHERE user_id = $1
        ORDER BY completed_at DESC
      `,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Could not fetch log history:", err.message);
    res.status(500).json({ message: "Could not fetch log history" });
  }
});

router.post("/workout/:splitId", async (req, res) => {
  const {
    exerciseNamesList,
    workoutId,
    setsData,
    notes,
    exerciseIdsList,
    workoutName,
  } = req.body;
  const splitId = req.params.splitId;
  const userId = req.user.id;

  if (
    !Array.isArray(exerciseIdsList) ||
    !Array.isArray(setsData) ||
    !Array.isArray(exerciseNamesList) ||
    exerciseIdsList.length !== setsData.length ||
    exerciseIdsList.length !== exerciseNamesList.length
  ) {
    return res.status(400).json({
      message: "Malformed workout data. Check list lengths and structure.",
    });
  }

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
        INSERT INTO workout_logs (user_id, workout_id, workout_name, split_id)
        VALUES ($1, $2, $3, $4)
        RETURNING log_id
      `,
      [userId, workoutId, workoutName, splitId]
    );

    const logId = result.rows[0].log_id;

    for (let i = 0; i < exerciseIdsList.length; i++) {
      const exerciseId = exerciseIdsList[i];
      const setsForThisExercise = setsData[i];
      const notesForThisExercise = notes[i] || null;
      const exerciseName = exerciseNamesList[i];

      // Accumulate the total volume for an exercise
      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;
      let highestWeight = 0;

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

        // Increment volume per set
        const setVolume = reps * weight;
        totalVolume += setVolume;
        totalSets++;
        totalReps += reps;

        // Get highest weight used for exercise from logged data
        if (weight > highestWeight) highestWeight = weight;
      }

      // Check if newly added data is a PR
      const highestVolumeRes = await pool.query(
        `
          SELECT MAX(evl.total_volume)
          FROM exercise_volume_logs evl
          JOIN workout_logs wl ON wl.log_id = evl.log_id
          WHERE evl.exercise_id = $1 AND wl.user_id = $2;
        `,
        [exerciseId, userId]
      );
      const highestRecordedVolume = highestVolumeRes.rows[0].max || 0;

      // Check if totalVolume is greater than the MAX value found in the total_volume column
      if (totalVolume > highestRecordedVolume) {
        // if it is, add it to PR table with user_id, exercise_id, pr_type (volume), value, log_id
        await pool.query(
          `
            INSERT INTO prs (user_id, exercise_id, pr_type, value, log_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, exercise_id, pr_type)
            DO UPDATE SET value = EXCLUDED.value, log_id = EXCLUDED.log_id, achieved_at = CURRENT_TIMESTAMP
          `,
          [userId, exerciseId, "volume", totalVolume, logId]
        );
      }

      // Write all datapoints to exercise_volume_logs
      await pool.query(
        `
          INSERT INTO exercise_volume_logs (log_id, exercise_id, total_volume, total_reps, set_count)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [logId, exerciseId, totalVolume, totalReps, totalSets]
      );

      const highestRecordedWeightRes = await pool.query(
        `
          SELECT MAX(value) FROM prs
          WHERE exercise_id = $1 AND user_id = $2 AND pr_type = $3
        `,
        [exerciseId, userId, "weight"]
      );

      const highestRecordedWeight = highestRecordedWeightRes.rows[0].max || 0;

      // Check if the weight for the exercise is a weight PR
      if (highestWeight > highestRecordedWeight) {
        // if it is, add it to PR table with user_id, exercise_id, pr_type (weight), value, log_id
        await pool.query(
          `
            INSERT INTO prs (user_id, exercise_id, pr_type, value, log_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, exercise_id, pr_type)
            DO UPDATE SET value = EXCLUDED.value, log_id = EXCLUDED.log_id, achieved_at = CURRENT_TIMESTAMP
          `,
          [userId, exerciseId, "weight", highestWeight, logId]
        );
      }
      /*       console.log("totalVolume:", totalVolume);
      console.log("highestRecordedVolume:", highestRecordedVolume); */
    }

    await pool.query("COMMIT");
    res.status(200).json({ message: "Successfully logged exercise!" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Something went wrong:", err.message);
    console.error("Workout log error:", err.stack || err);
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
          log_id,
          completed_at,
          workout_name
        FROM workout_logs
        WHERE user_id = $1 AND split_id = $2
        ORDER BY completed_at DESC
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
