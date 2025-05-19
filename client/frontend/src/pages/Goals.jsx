import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";
import InfoModal from "../components/InfoModal";

export default function Goals() {
  const { setIsLoading, exercises, showInfoModal, setShowInfoModal } =
    useContext(GlobalContext);
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
      {showInfoModal && (
        <InfoModal
          message={"How to calculate total volume for an exercise"}
          subMessage={
            "Total number of repetitions x weight x number of sets. You can calculate your current volume PR for an exercise and set this to a slightly higher number for an appropriate volume goal to aim for."
          }
          onClick={() => setShowInfoModal(false)}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-52">
        🎯 Personal Goals
      </h1>
      <div className="flex flex-col">
        {!addingNewGoal && (
          <button
            onClick={() => setAddingNewGoal(!addingNewGoal)}
            className="mt-3 mb-5 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            + Add new goal
          </button>
        )}
        {addingNewGoal && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Optional Title
              </h2>
              <input
                placeholder="Enter goal title"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
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
              {selectedGoalType === "1RM" && (
                <div className="flex flex-col gap-5">
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
                  <div>
                    <h2 className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Weight (kg)
                    </h2>
                    <input
                      type="number"
                      placeholder="Enter weight goal"
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              {selectedGoalType === "Volume" && (
                <div className="relative flex flex-col gap-5">
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
                  <div>
                    <h2 className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Volume Goal (total kg){" "}
                      <i
                        onClick={() => setShowInfoModal(true)}
                        className="fa-regular fa-circle-question text-sm cursor-pointer"
                      ></i>
                    </h2>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              {selectedGoalType === "Custom" && (
                <div className="relative flex flex-col gap-5">
                  <div className="relative">
                    <h2 className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Describe your goal here:
                    </h2>
                    <textarea className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                  </div>
                </div>
              )}
            </div>
            <button className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Submit goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
