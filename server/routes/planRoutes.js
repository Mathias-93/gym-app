import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/workout_splits", async (req, res) => {
  try {
    const userId = req.user.id;
    const splits = await pool.query(
      "SELECT * FROM workout_splits WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(splits.rows);
  } catch (err) {
    console.log("Error fetching splits:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Saving a custom split to db

router.post("/save_custom_split", async (req, res) => {
  try {
    await pool.query("BEGIN");
    const { splitName, numberOfDays, workoutsObject } = req.body;
    const userId = req.user.id;

    // Adding split to workout_splits table
    const newSplit = await pool.query(
      `
      INSERT INTO workout_splits (user_id, name, days_per_week, is_custom)
      VALUES ($1, $2, $3, $4)
      RETURNING split_id
      `,
      [userId, splitName, numberOfDays, true]
    );

    // Adding split to workouts table
    for (const [key, value] of Object.entries(workoutsObject)) {
      const newWorkout = await pool.query(
        `
        INSERT INTO workouts (split_id, name, is_custom, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING workout_id
        `,
        [
          newSplit.rows[0].split_id,
          `${splitName} Day ${parseInt(key) + 1}`,
          true,
          userId,
        ]
      );
      for (const exerciseName of value) {
        const existingExercise = await pool.query(
          `
          SELECT exercise_id FROM exercises WHERE name=$1
          `,
          [exerciseName]
        );

        let exerciseId;

        if (existingExercise.rows.length > 0) {
          exerciseId = existingExercise.rows[0].exercise_id;
        } else {
          const newExercise = await pool.query(
            `INSERT INTO exercises (name, is_custom, user_id)
             VALUES ($1, $2, $3)
             RETURNING exercise_id`,
            [exerciseName, true, userId]
          );
          exerciseId = newExercise.rows[0].exercise_id;
        }

        await pool.query(
          `
          INSERT INTO workout_exercises_junction_table (workout_id, exercise_id)
          VALUES ($1, $2)
          `,
          [newWorkout.rows[0].workout_id, exerciseId]
        );
      }
    }
    await pool.query("COMMIT");
    res.status(201).json({
      message: "Split successfully added to database",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.log("Error saving split to db:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/workouts", async (req, res) => {
  try {
    const allWorkouts = await pool.query("SELECT * FROM workouts");
    res.status(200).json(allWorkouts.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put("/update_split/:splitId", async (req, res) => {
  const userId = req.user.id;
  const splitId = req.params.splitId;
  const { name, workouts } = req.body;

  try {
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/split/:splitId/full", async (req, res) => {
  const userId = req.user.id;
  const splitId = req.params.splitId;

  try {
    const results = await pool.query(
      `
      SELECT
        w.workout_id,
        w.name AS workout_name,
        w.is_custom,
        wejt.exercise_id,
        e.name AS exercise_name
      FROM workouts w
      JOIN workout_exercises_junction_table wejt ON w.workout_id = wejt.workout_id
      JOIN exercises e ON wejt.exercise_id = e.exercise_id
      WHERE w.split_id = $1 AND w.user_id = $2
      ORDER BY w.workout_id
      `,
      [splitId, userId]
    );
    const groupedWorkouts = [];
    const workoutMap = new Map();

    for (const row of results.rows) {
      const {
        workout_id,
        workout_name,
        is_custom,
        exercise_id,
        exercise_name,
      } = row;

      if (!workoutMap.has(workout_id)) {
        const newWorkout = {
          workout_id,
          name: workout_name,
          is_custom,
          exercises: [],
        };
        workoutMap.set(workout_id, newWorkout);
        groupedWorkouts.push(newWorkout);
      }

      workoutMap.get(workout_id).exercises.push({
        exercise_id,
        name: exercise_name,
      });
    }
    res.status(200).json(groupedWorkouts);
  } catch (error) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
