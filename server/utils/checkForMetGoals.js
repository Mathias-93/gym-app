const checkForMetGoals = async (
  userId,
  exerciseId,
  prValue,
  goalType,
  pool
) => {
  // Find exercise in the goals table and see if it has a goal
  const goalQuery = await pool.query(
    `
        SELECT target_value, goal_id, exercise_id
        FROM goals 
        WHERE user_id = $1 AND exercise_id = $2 AND goal_type = $3 AND is_completed = false
        `,
    [userId, exerciseId, goalType]
  );
  let completedGoals = [];

  // Make sure we loop over results if there are mutliple goals for the same exercise that are uncompleted
  for (const row of goalQuery.rows) {
    const goalValue = Number(row.target_value);

    // Check if the volume PR hits a goal for that exercise
    if (!isNaN(goalValue) && prValue >= goalValue) {
      // Set goal to completed
      await pool.query(
        `
            UPDATE goals 
            SET is_completed = true, completed_at = CURRENT_TIMESTAMP
            WHERE goal_id = $1
        `,
        [row.goal_id]
      );

      completedGoals.push({
        goal_id: row.goal_id,
        goal_type: goalType,
        exercise_id: row.exercise_id,
      });
    }
  }
  return completedGoals;
};

export default checkForMetGoals;
