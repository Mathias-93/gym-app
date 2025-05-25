import React from "react";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router";
import CustomToast from "../components/CustomToast";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../api/config";

export default function AddNewSplit() {
  const { setIsLoading, exercises, showSpinner } = useContext(GlobalContext);
  const [splitName, setSplitName] = useState("");
  const [days, setDays] = useState(3); // Default to 3 days
  const [workouts, setWorkouts] = useState({});
  const [searchParam, setSearchParam] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); // e.g., 'Monday-0'
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownref = useClickOutsideAndEscape(() => {
    setActiveDropdown(null);
    setFilteredExercises([]);
  });

  const navigate = useNavigate();

  const handleExercisesFilter = (day, index, query) => {
    const lowerQuery = query.toLowerCase();
    setSearchParam(lowerQuery);

    if (lowerQuery.length > 1) {
      const filteredData =
        exercises?.filter(
          (exercise) => exercise.name.toLowerCase().includes(lowerQuery) // Only filtering by name
        ) || [];

      setFilteredExercises(filteredData);
      setActiveDropdown(`${day}-${index}`);
      setHighlightedIndex(0);
    } else {
      setActiveDropdown(null);
    }
  };

  const handleClickDropdown = (day, index, exerciseName) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]: prev[day]?.map(
        (exercise, i) => (i === index ? exerciseName : exercise) // Update the correct field
      ),
    }));
    setActiveDropdown(null);
    setFilteredExercises([]);
    setHighlightedIndex(0);
  };

  // Remove exercise from form for specific day
  const removeExercise = (day, index) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  // Dynamically update workouts for each day
  const handleWorkoutChange = (day, index, value) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]:
        prev[day]?.map((exercise, i) => (i === index ? value : exercise)) || [],
    }));
  };

  // Add a new workout field for a specific day
  const addWorkout = (day) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), ""], // Add empty input for new exercise
    }));
  };

  // For making sure the custom split is a valid format
  const validateSplit = (splitName, days, workouts) => {
    if (
      typeof splitName !== "string" ||
      splitName.trim().length === 0 ||
      days < 2 ||
      days > 12
    ) {
      return false;
    }

    const isValidFormat = (exerciseList) => {
      return (
        Array.isArray(exerciseList) &&
        exerciseList.length > 0 &&
        exerciseList.every(
          (exercise) =>
            typeof exercise === "string" && exercise.trim().length > 0
        )
      );
    };

    const allWorkoutsValid = Object.values(workouts).every(isValidFormat);

    return allWorkoutsValid;
  };

  const addCustomSplitToDb = async (splitName, days, workouts) => {
    if (!validateSplit(splitName, days, workouts)) {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Could not create split, please make sure all fields are filled in correctly."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/plan/save_custom_split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          splitName: splitName,
          numberOfDays: days,
          workouts: workouts,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
      }

      const data = await response.json();
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast t={t} message="Split created!" type="success" />
          ),
        { duration: 5000, position: "top-center" }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("Something went wrong:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setHighlightedIndex(0); // Reset when filtered list updates
  }, [filteredExercises]);

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 text-center mt-52 mb-10">
        🔁🏋️ Add New Split
      </h1>
      <div className="w-full mid:min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Split Name Input */}
        <div className="mb-5">
          <label className="block text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">
            Split Name
          </label>
          <input
            type="text"
            value={splitName}
            onChange={(e) => setSplitName(e.target.value)}
            placeholder="Enter split name"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Select Number of Days */}
        <div className="mb-5">
          <label className="block text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1">
            Number of workout days per split
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Dynamic Workout Sections */}
        {Array.from({ length: days }, (_, day) => (
          <div key={day} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Workout {day + 1}
            </h2>
            {workouts[day]?.map((exercise, index) => (
              <div key={index} className="flex items-center space-x-3 relative">
                <input
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
                        handleClickDropdown(day, index, selectedName);
                      }
                    }
                  }}
                  type="text"
                  value={exercise}
                  onChange={(e) => {
                    handleWorkoutChange(day, index, e.target.value);
                    handleExercisesFilter(day, index, e.target.value);
                  }}
                  placeholder={`Exercise ${index + 1}`}
                  className="flex-1 mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {activeDropdown === `${day}-${index}` &&
                  filteredExercises.length > 0 && (
                    <SuggestionDropdown
                      highlightedIndex={highlightedIndex}
                      ref={dropdownref}
                      data={filteredExercises}
                      handleClickDropdown={(exerciseName) =>
                        handleClickDropdown(day, index, exerciseName)
                      }
                    />
                  )}
                <button
                  type="button"
                  onClick={() => removeExercise(day, index)}
                  className="mt-2 w-8 h-8 flex items-center justify-center rounded-lg"
                >
                  <i className="fa-solid fa-xmark text-2xl text-red-700 hover:text-red-400 transition"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addWorkout(day)}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition"
            >
              + Add Exercise
            </button>
          </div>
        ))}

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            type="button"
            className="w-1/2 dark:bg-red-600 dark:hover:bg-red-500 bg-red-500 hover:bg-red-400 text-white font-semibold dark:text-white py-3 rounded-lg mr-2 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 bg-green-500 text-white py-3 rounded-lg ml-2 hover:bg-green-600 font-semibold transition dark:bg-green-600 dark:hover:bg-green-500"
            onClick={() => addCustomSplitToDb(splitName, days, workouts)}
          >
            Save Split
          </button>
        </div>
      </div>
    </div>
  );
}
