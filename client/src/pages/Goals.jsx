import React from "react";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";
import InfoModal from "../components/InfoModal";
import { toast } from "react-hot-toast";
import CustomToast from "../components/CustomToast";
import CustomModal from "../components/CustomModal";
import { useNavigate } from "react-router";
import { BASE_URL } from "../api/config";

export default function Goals() {
  const {
    setIsLoading,
    exercises,
    showInfoModal,
    setShowInfoModal,
    showModal,
    setShowModal,
    isAuthenticated,
    isLoadingAuth,
  } = useContext(GlobalContext);
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
  const [refreshGoals, setRefreshGoals] = useState(0);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const dropdownref = useClickOutsideAndEscape(() => {
    setDropdownIsActive(false);
    setFilteredExercises(null);
  });
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoadingAuth) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleViewCompletedGoals = () => {
    navigate("/completedgoals", {
      state: { completedGoals },
    });
  };

  const handleFilterExercises = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.length > 1) {
      const filteredData =
        exercises?.filter((exercise) =>
          exercise.name.toLowerCase().includes(lowerQuery)
        ) || [];

      setFilteredExercises(filteredData);
      setDropdownIsActive(true);
      setHighlightedIndex(0);
    } else {
      setDropdownIsActive(false);
    }
  };

  const handleClickDropdown = (exerciseName) => {
    setSelectedExercise(exerciseName);
    setDropdownIsActive(false);
    setHighlightedIndex(0);
  };

  const collectAndVerifyData = async () => {
    let validationErrors = [];

    const matchingExercise = selectedExercise
      ? exercises.find(
          (exercise) =>
            exercise.name.toLowerCase().trim() ===
            selectedExercise.toLowerCase().trim()
        )
      : null;

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

    // Write verification logic to make sure data is formatted correctly
    if (!goalFormData.goal_type) {
      validationErrors.push("You must select a goal type.");
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="You must select a goal type."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      return;
    }

    if (
      (goalFormData.goal_type === "Weight" ||
        goalFormData.goal_type === "Volume") &&
      (!goalFormData.selected_exercise_name ||
        goalFormData.target_value === null ||
        goalFormData.target_value === 0)
    ) {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Please provide an exercise and a target value greater than 0."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      validationErrors.push(
        "Please provide an exercise and a target value greater than 0."
      );
      return;
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
      const response = await fetch(`${BASE_URL}/goals/create_goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalFormData),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 409) {
          toast.custom(
            (t) =>
              t.visible && (
                <CustomToast
                  t={t}
                  message="Could not add goal; you've already achieved this goal!"
                  type="info"
                />
              ),
            { duration: 5000, position: "top-center" }
          );
        } else {
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
        }

        // Still throw to enter the catch block if needed
        throw new Error(`Goal save failed with status: ${response.status}`);
      }
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast t={t} message="Goal saved!" type="success" />
          ),
        { duration: 5000, position: "top-center" }
      );
      setRefreshGoals((prev) => prev + 1);
      setAddingNewGoal(false);
    } catch (err) {
      console.log("Something went wrong when saving goal", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCustomGoal = async (goalId, currentCompletedStatus) => {
    try {
      setIsLoading(true);
      await fetch(`${BASE_URL}/goals/update_custom_goal/${goalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isCompleted: !currentCompletedStatus }),
      });
      setRefreshGoals((prev) => prev + 1);
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Goal completed, solid effort 💪"
              type="success"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserGoal = async (goalId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/goals/delete_goal/${goalId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setRefreshGoals((prev) => prev + 1);
      if (!response.ok) {
        throw new Error();
      }
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast t={t} message="Goal deleted!" type="success" />
          ),
        { duration: 5000, position: "top-center" }
      );
    } catch (err) {
      console.log(err.message);
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Something went wrong, could not deleted goal"
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserGoals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/goals/user_goals`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.warn("User is not authorized to view goals.");
          setGoalsData(null);
          return;
        }

        throw new Error("Failed to fetch goals");
      }

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
  }, [refreshGoals]);

  useEffect(() => {
    setHighlightedIndex(0); // Reset when filtered list updates
  }, [filteredExercises]);

  const activeGoals = goalsData?.filter((goal) => !goal.is_completed);
  const completedGoals = goalsData?.filter((goal) => goal.is_completed);

  return (
    <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <InfoModal
            message="How to calculate total volume for an exercise"
            subMessage="Total volume equals the total number of repetitions x weight x number of sets. You can calculate your current volume PR for an exercise and set this to a slightly higher number for an appropriate volume goal to aim for."
            onClick={() => setShowInfoModal(false)}
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-52 mb-10 text-center">
        🎯 Personal Goals
      </h1>

      {activeGoals?.length > 0 && (
        <div className="w-full max-w-2xl mb-10 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            🧭 Current Goals
          </h2>

          {activeGoals?.map((goal, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex flex-col text-gray-800 dark:text-white">
                <span className="text-lg font-semibold">
                  {goal.goal_type === "Custom" ? (
                    <div className="flex gap-4 ">
                      📝 Custom Goal
                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowOtherModal(true);
                        }}
                        className="text-lg text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
                        title={goal.is_completed ? null : "Mark as complete"}
                      >
                        {}
                        <div className="flex gap-2">
                          <i className="fa-regular fa-square flex items-center"></i>
                          <span className="text-sm italic text-gray-500 dark:text-gray-400">
                            Mark as complete
                          </span>
                        </div>
                      </button>
                      {showOtherModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
                          <CustomModal
                            buttonColors={
                              "bg-blue-500 text-white dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-600 transition"
                            }
                            confirmMessage={"mark this goal as completed?"}
                            secondMessage={"This action cannot be undone."}
                            confirmButton={"Complete"}
                            onCancel={() => setShowOtherModal(false)}
                            onConfirm={() => {
                              toggleCustomGoal(
                                selectedGoal.goal_id,
                                selectedGoal.is_completed
                              );
                              setShowOtherModal(false);
                              setSelectedGoal(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    `${goal.goal_type} Goal for ${
                      exercises.find(
                        (exercise) => exercise.exercise_id === goal.exercise_id
                      )?.name || "unknown exercise"
                    }`
                  )}
                </span>

                {goal.goal_type !== "Custom" ? (
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {goal.current_value} / {goal.target_value} kg
                  </span>
                ) : (
                  <div className="flex items-center justify-between gap-4 mt-1">
                    {/* Description */}
                    <span className="text-sm italic text-gray-500 dark:text-gray-400">
                      {goal.custom_goal_description}
                    </span>
                  </div>
                )}
              </div>
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
                  <CustomModal
                    buttonColors={"bg-red-500 hover:bg-red-600 text-white n"}
                    confirmMessage={"delete this goal?"}
                    secondMessage={"This action cannot be undone."}
                    confirmButton={"Delete"}
                    onCancel={() => setShowModal(false)}
                    onConfirm={() => {
                      deleteUserGoal(selectedGoal.goal_id);
                      setShowModal(false);
                      setSelectedGoal(null);
                    }}
                  />
                </div>
              )}

              {!goal.is_completed && (
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowModal(true);
                  }}
                  className="mt-3 md:mt-0 inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl">
        {!addingNewGoal && (
          <button
            onClick={() => setAddingNewGoal(true)}
            className="w-full bg-blue-500 text-white py-3 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-600 transition font-semibold"
          >
            <span className="text-lg">+</span> Add new goal
          </button>
        )}

        {addingNewGoal && (
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-300 dark:border-gray-700 space-y-6">
            {/* Optional Title */}
            <div>
              <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Optional Title
              </label>
              <input
                value={optionalTitle}
                onChange={(e) => setOptionalTitle(e.target.value)}
                placeholder="Enter goal title"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Goal Type Select */}
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

            {/* Goal Type Specific Inputs */}
            {(selectedGoalType === "Weight" ||
              selectedGoalType === "Volume") && (
              <>
                {/* Exercise input */}
                <div className="relative">
                  <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Exercise
                  </label>
                  <input
                    value={selectedExercise || ""}
                    onChange={(e) => {
                      handleFilterExercises(e.target.value);
                      setSelectedExercise(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (!filteredExercises || filteredExercises.length === 0)
                        return;

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev < filteredExercises.length - 1 ? prev + 1 : 0
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev > 0 ? prev - 1 : filteredExercises.length - 1
                        );
                      }

                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (filteredExercises[highlightedIndex]) {
                          const selectedName =
                            filteredExercises[highlightedIndex].name;
                          handleClickDropdown(selectedName);
                        }
                      }
                    }}
                    placeholder="Search for an exercise"
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {dropdownIsActive && filteredExercises?.length > 0 && (
                    <SuggestionDropdown
                      highlightedIndex={highlightedIndex}
                      ref={dropdownref}
                      data={filteredExercises}
                      handleClickDropdown={(exerciseName) =>
                        handleClickDropdown(exerciseName)
                      }
                    />
                  )}
                </div>

                {/* Weight or Volume input */}
                <div>
                  <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {selectedGoalType === "Weight"
                      ? "Weight Goal (kg)"
                      : "Volume Goal (total kg)"}{" "}
                    {selectedGoalType === "Volume" && (
                      <i
                        onClick={() => setShowInfoModal(true)}
                        className="fa-regular fa-circle-question text-sm cursor-pointer ml-1"
                      ></i>
                    )}
                  </label>
                  <input
                    value={goalValue}
                    onChange={(e) => setGoalValue(e.target.value)}
                    type="number"
                    placeholder={
                      selectedGoalType === "Weight"
                        ? "Enter weight goal"
                        : "Enter volume goal"
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {selectedGoalType === "Custom" && (
              <div>
                <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Describe your goal here:
                </label>
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  rows={4}
                  placeholder="Write your custom goal description..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={() => {
                collectAndVerifyData();
              }}
              className="w-full bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Submit goal
            </button>
            <button
              onClick={() => {
                setAddingNewGoal(false);
                setSelectedGoalType(null);
                setSelectedExercise(null);
                setGoalValue(0);
              }}
              className="w-full py-3 rounded-lg font-semibold dark:bg-red-600 dark:hover:bg-red-500 bg-red-500 hover:bg-red-600 text-white transition"
            >
              Cancel
            </button>
          </div>
        )}
        <button
          onClick={handleViewCompletedGoals}
          className="mt-4 w-full px-4 py-2 font-semibold text-gray-800 bg-gray-300 hover:bg-gray-400 dark:bg-gray-300 dark:hover:bg-gray-400 dark:text-gray-800 rounded-lg transition"
        >
          🏆 View Completed Goals
        </button>
      </div>
    </div>
  );
}
