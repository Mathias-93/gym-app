const insertExercisesForWorkout = async (
  pool,
  workout_id,
  exercises,
  user_id
) => {
  for (const exercise of exercises) {
    const exerciseName = exercise.name.trim();

    if (!exerciseName) continue;

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
        [exerciseName, true, user_id]
      );
      exerciseId = newExercise.rows[0].exercise_id;
    }

    await pool.query(
      `
          INSERT INTO workout_exercises_junction_table (workout_id, exercise_id)
          VALUES ($1, $2)
          `,
      [workout_id, exerciseId]
    );
  }
};

export default insertExercisesForWorkout;
