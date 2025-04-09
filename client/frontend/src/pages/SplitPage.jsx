import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import { useParams } from "react-router";

export default function SplitPage() {
  const { splitId } = useParams();
  const { userSplit, setUserSplit, isLoading, fetchUserSplit, setIsLoading } =
    useContext(GlobalContext);
  const [localUserSplit, setLocalUserSplit] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [editableWorkouts, setEditableWorkouts] = useState([]);

  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:1337/plan/split/${splitId}/full`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log("Fetched workouts:", data);
        console.log("Cloned workouts:", structuredClone(data));
        setWorkouts(data);
        setEditableWorkouts(structuredClone(data));
      } else {
        console.error("Fetch failed with status:", response.status);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeExercise = () => {
    console.log("Change!");
  };

  useEffect(() => {
    if (!userSplit || userSplit.length === 0) {
      fetchUserSplit();
    } else {
      const match = userSplit.find(
        (split) => split.split_id.toString() === splitId
      );
      setLocalUserSplit(match);
    }

    console.log(localUserSplit);
  }, [userSplit, splitId]);

  useEffect(() => {
    fetchWorkouts();
    console.log(workouts);
  }, [localUserSplit]);

  if (isLoading || !localUserSplit) {
    return (
      <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px] flex justify-center">
        <p className="flex justify-center text-center text-gray-500 text-4xl">
          Loading...
        </p>
      </div>
    );
  }

  return (
    // Whole thing
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 mt-10 justify-center items-center">
      <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-gray-200">
        {localUserSplit?.name}
      </h1>
      {/* Form */}
      {editableWorkouts.map((workout) => {
        return (
          <div
            key={workout.workout_id}
            className="w-full min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
              {workout?.name}
            </h1>
            {workout.exercises.map((exercise, index) => {
              return (
                <div key={index}>
                  <div className="mb-6">
                    <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Exercise {index + 1}
                    </h2>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={() => handleChangeExercise()}
                        className="flex-1 mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="w-1/2 bg-green-500 text-white py-3 rounded-lg ml-2 hover:bg-green-600 transition"
        >
          Save Split
        </button>
      </div>
    </div>
  );
}
