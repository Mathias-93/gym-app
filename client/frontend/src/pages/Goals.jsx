import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";

export default function Goals() {
  const { setIsLoading, exercises } = useContext(GlobalContext);
  const [goalsData, setGoalsData] = useState(null);
  const [addingNewGoal, setAddingNewGoal] = useState(false);
  const [goalTypes, setGoalTypes] = useState(["1RM", "Volume", "Custom"]);
  const [selectedGoalType, setSelectedGoalType] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState(null);
  const [dropdownIsActive, setDropdownIsActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const dropdownref = useClickOutsideAndEscape(() => {
    setDropdownIsActive(false);
    setFilteredExercises(null);
  });

  const handleFilterExercises = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.length > 1) {
      const filteredData =
        exercises?.filter((exercise) =>
          exercise.name.toLowerCase().includes(lowerQuery)
        ) || [];

      setFilteredExercises(filteredData);
      setDropdownIsActive(true);
    } else {
      setDropdownIsActive(false);
    }
  };

  const handleClickDropdown = (exerciseName) => {
    setSelectedExercise(exerciseName);
    setDropdownIsActive(false);
  };

  const fetchUserGoals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:1337/goals/user_goals", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      setGoalsData(data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGoals();
  }, []);

  /* console.log(goalsData); */

  return (
    <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center gap-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-52">
        🎯 Personal Goals
      </h1>
      <div className="flex flex-col">
        <button
          onClick={() => setAddingNewGoal(!addingNewGoal)}
          className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          + Add new goal
        </button>
        {addingNewGoal && (
          <div className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="goal-type-select"
                className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200"
              >
                Type of goal
              </label>
              <select
                id="goal-type-select"
                value={selectedGoalType || ""}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  const type = goalTypes.find((t) => t === selectedType);
                  setSelectedGoalType(type);
                }}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  -- Select a goal type --
                </option>
                {goalTypes?.map((goalType, index) => (
                  <option key={index} value={goalType}>
                    {goalType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {selectedGoalType !== "Custom" && selectedGoalType !== null ? (
                <div className="relative">
                  <h2 className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Exercise
                  </h2>
                  <input
                    value={selectedExercise || ""}
                    onChange={(e) => {
                      handleFilterExercises(e.target.value);
                      setSelectedExercise(e.target.value);
                    }}
                    placeholder="Search for an exercise"
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {dropdownIsActive && filteredExercises?.length > 0 && (
                    <SuggestionDropdown
                      ref={dropdownref}
                      data={filteredExercises}
                      handleClickDropdown={(exerciseName) =>
                        handleClickDropdown(exerciseName)
                      }
                    />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
