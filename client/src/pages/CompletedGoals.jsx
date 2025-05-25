import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalContext } from "../Context";
import { useContext } from "react";

export default function CompletedGoals() {
  const { exercises } = useContext(GlobalContext);
  const location = useLocation();
  const completedGoals = location.state?.completedGoals || [];

  // optional fallback if someone visits directly without state
  if (completedGoals.length === 0) {
    return (
      <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
        <p className="text-center text-gray-500 mt-48">
          No completed goals yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto py-10 mt-48">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          ✅ Completed Goals
        </h2>
        {completedGoals.map((goal, index) => (
          <div
            key={index}
            className="mb-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <div className="flex flex-col">
              <span className="text-lg font-semibold block text-gray-800 dark:text-white">
                {goal.goal_type === "Custom"
                  ? "📝 Custom Goal"
                  : `${goal.goal_type} Goal for ${
                      exercises?.find(
                        (exercise) => goal.exercise_id === exercise.exercise_id
                      )?.name || "unknown exercise"
                    }`}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {goal.goal_type === "Custom"
                  ? goal.custom_goal_description
                  : `Target: ${goal.target_value} kg`}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(goal.completed_at).toLocaleDateString("en-GB")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
