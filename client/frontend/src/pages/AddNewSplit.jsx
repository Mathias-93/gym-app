import React, { useContext, useState } from "react";
import { GlobalContext } from "../Context";
import SuggestionDropdown from "../components/SuggestionDropdown";

export default function AddNewSplit() {
  const { setIsLoading, exercises, setExercises } = useContext(GlobalContext);
  const [splitName, setSplitName] = useState("");
  const [days, setDays] = useState(3); // Default to 3 days
  const [workouts, setWorkouts] = useState({});
  const [searchParam, setSearchParam] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState([]);

  const handleExercisesFilter = (query) => {
    const lowerQuery = query.toLowerCase();
    setSearchParam(lowerQuery);

    if (lowerQuery.length > 1) {
      const filteredData =
        exercises?.filter(
          (exercise) => exercise.name.toLowerCase().includes(lowerQuery) // Only filtering by name
        ) || [];

      setFilteredExercises(filteredData);
      setShowDropdown(filteredData.length > 0); // Only show dropdown if results exist
    } else {
      setShowDropdown(false);
    }
  };

  const handleClickDropdown = (day, index, exerciseName) => {
    setWorkouts((prev) => ({
      ...prev,
      [day]: prev[day].map(
        (exercise, i) => (i === index ? exerciseName : exercise) // Update the correct field
      ),
    }));
    setShowDropdown(false);
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

  const addCustomSplitToDb = async (days, splitname) => {
    console.log("added.. NOT");
    console.log("LOOK HERE", filteredExercises);
  };

  return (
    <div className="mt-[200px] flex justify-center">
      <div className="w-full min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Add New Split
        </h1>

        {/* Split Name Input */}
        <div className="mb-5">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
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
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
            Number of Workouts per split
          </label>
          <input
            type="number"
            min="1"
            max="7"
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
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={exercise}
                  onChange={(e) => {
                    handleWorkoutChange(day, index, e.target.value);
                    handleExercisesFilter(e.target.value);
                  }}
                  placeholder={`Exercise ${index + 1}`}
                  className="flex-1 mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {showDropdown && (
                  <SuggestionDropdown
                    data={filteredExercises}
                    handleClickDropdown={(exerciseName) =>
                      handleClickDropdown(day, index, exerciseName)
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeExercise(day, index)}
                  className="mt-2 w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addWorkout(day)}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              + Add Exercise
            </button>
          </div>
        ))}

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="w-1/2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg mr-2 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 bg-green-500 text-white py-3 rounded-lg ml-2 hover:bg-green-600 transition"
            onClick={() => addCustomSplitToDb(days, splitName)}
          >
            Save Split
          </button>
        </div>
      </div>
    </div>
  );
}
