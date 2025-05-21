import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";
import InfoModal from "../components/InfoModal";
import { toast } from "react-hot-toast";
import CustomToast from "../components/CustomToast";

export default function Goals() {
  const { setIsLoading, exercises, showInfoModal, setShowInfoModal } =
    useContext(GlobalContext);
  const [goalsData, setGoalsData] = useState(null);
  const [addingNewGoal, setAddingNewGoal] = useState(false);
  const [goalTypes, setGoalTypes] = useState(["Weight", "Volume", "Custom"]);
  const [selectedGoalType, setSelectedGoalType] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState(null);
  const [dropdownIsActive, setDropdownIsActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [optionalTitle, setOptionalTitle] = useState("");
  const [goalValue, setGoalValue] = useState(0);
  const [customGoal, setCustomGoal] = useState("");
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

  const collectAndVerifyData = async () => {
    const matchingExercise = exercises.find(
      (exercise) =>
        exercise.name.toLowerCase().trim() ===
        selectedExercise.toLowerCase().trim()
    );

    // Collect all the form data into one object
    const goalFormData = {
      title: optionalTitle.trim() || null,
      goal_type: selectedGoalType,
      selected_exercise_name:
        selectedGoalType === "Custom" ? null : selectedExercise?.trim(),
      selected_exercise_id: matchingExercise?.exercise_id,
      target_value:
        selectedGoalType === "Custom" && !isNaN(goalValue)
          ? null
          : Number(goalValue),
      custom_goal_description:
        selectedGoalType === "Custom" ? customGoal.trim() : null,
    };
    let validationErrors = [];

    // Write verification logic to make sure data is formatted correctly
    if (!goalFormData.goal_type) {
      validationErrors.push("You must select a goal type.");
    }

    if (
      (goalFormData.goal_type === "weight" ||
        goalFormData.goal_type === "volume") &&
      (!goalFormData.selected_exercise_name ||
        goalFormData.target_value === null ||
        goalFormData.target_value === 0)
    ) {
      validationErrors.push(
        "Please provide an exercise and a target value greater than 0."
      );
    }

    if (
      goalFormData.goal_type === "Custom" &&
      !goalFormData.custom_goal_description
    ) {
      validationErrors.push("Please enter a description for your custom goal.");
    }

    if (!matchingExercise && selectedGoalType !== "Custom") {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Please select an already existing exercise."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      console.log("Validation failed:", validationErrors);
      return;
    }

    if (validationErrors.length > 0) {
      // show toast, modal, or inline errors
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Please make sure all fields are filled in with valid information."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      console.log("Validation failed:", validationErrors);
      return;
    }

    // Call POST function to save to backend
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:1337/goals/create_goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalFormData),
        credentials: "include",
      });

      if (!response.ok) {
        toast.custom(
          (t) =>
            t.visible && (
              <CustomToast
                t={t}
                message="Server error; goal not saved"
                type="error"
              />
            ),
          { duration: 5000, position: "top-center" }
        );
        throw new Error(
          `Something went wrong when saving goal ${response.statusText}`
        );
      }
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast t={t} message="Goal saved!" type="success" />
          ),
        { duration: 5000, position: "top-center" }
      );
    } catch (err) {
      console.log("Something went wrong when saving goal", err.message);
    } finally {
      setIsLoading(false);
    }
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
                value={optionalTitle}
                onChange={(e) => setOptionalTitle(e.target.value)}
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
              {selectedGoalType === "Weight" && (
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
                      Weight goal (kg)
                    </h2>
                    <input
                      value={goalValue}
                      onChange={(e) => setGoalValue(e.target.value)}
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
                      value={goalValue}
                      onChange={(e) => setGoalValue(e.target.value)}
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
                    <textarea
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => collectAndVerifyData()}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Submit goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
