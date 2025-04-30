import React, { useContext, useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";

export default function LogPage() {
  const { workouts, showSpinner } = useContext(GlobalContext);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  if (showSpinner) {
    return <Spinner />;
  }
  console.log(workouts);
  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
      <div className="flex flex-col gap-4 w-full max-w-md">
        {workouts?.map((workout) => (
          <button
            key={workout.workout_id}
            onClick={() => setSelectedWorkout(workout)}
            className={`w-full text-lg font-medium px-6 py-3 rounded-full transition-colors duration-200
        ${
          selectedWorkout?.workout_id === workout.workout_id
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        }`}
          >
            {workout.name}
          </button>
        ))}
      </div>
    </div>
  );
}
