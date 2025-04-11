import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import { useParams } from "react-router";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";
import SuggestionDropdown from "../components/SuggestionDropdown";

export default function SplitPage() {
  const { splitId } = useParams();
  const {
    userSplit,
    setUserSplit,
    isLoading,
    fetchUserSplit,
    setIsLoading,
    exercises,
    setExercises,
  } = useContext(GlobalContext);
  const [localUserSplit, setLocalUserSplit] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [editableWorkouts, setEditableWorkouts] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [splitNameIsEdit, setSplitNameIsEdit] = useState(false);
  const [editableSplitName, setEditableSplitName] = useState("");
  const [workoutNameIsEdit, setWorkoutNameIsEdit] = useState(false);
  const [editableWorkoutNames, setEditableWorkoutNames] = useState([]);

  const dropdownref = useClickOutsideAndEscape(() => {
    setActiveDropdown(null);
    setFilteredExercises([]);
  });

  const handleEditSplitName = (newName) => {
    setLocalUserSplit((prev) => ({
      ...prev,
      name: newName,
    }));
  };

  const handleEditWorkoutName = (workoutIndex, newName) => {
    setEditableWorkouts((prev) => {
      const updated = structuredClone(prev);
      updated[workoutIndex].name = newName;
      return updated;
    });
  };

  const handleExercisesFilter = (workoutIndex, exerciseIndex, exerciseName) => {
    const lowerExerciseName = exerciseName.toLowerCase();
    setSearchParam(lowerExerciseName);

    if (lowerExerciseName.length > 1) {
      const filteredData =
        exercises?.filter(
          (exercise) => exercise.name.toLowerCase().includes(lowerExerciseName) // Only filtering by name
        ) || [];

      setFilteredExercises(filteredData);
      setActiveDropdown(`${workoutIndex}-${exerciseIndex}`);
    } else {
      setActiveDropdown(null);
    }
  };

  const handleClickDropdown = (exerciseIndex, workoutIndex, name) => {
    setEditableWorkouts((prev) => {
      const updated = structuredClone(prev);
      updated[workoutIndex].exercises[exerciseIndex].name = name;
      return updated;
    });

    setActiveDropdown(null);
    setFilteredExercises([]);
  };

  const handleChangeExercise = (exerciseIndex, workoutIndex, newName) => {
    setEditableWorkouts((prev) => {
      const updated = structuredClone(prev);
      updated[workoutIndex].exercises[exerciseIndex].name = newName;
      return updated;
    });
  };

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
        // console.log("Fetched workouts:", data);
        // console.log("Cloned workouts:", structuredClone(data));
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

  const applyWorkoutNameChanges = () => {
    setEditableWorkouts((prev) =>
      prev.map((workout, i) => ({
        ...workout,
        name: editableWorkoutNames[i],
      }))
    );
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
    console.log("Local User Split:", localUserSplit);
  }, [userSplit, splitId]);

  useEffect(() => {
    fetchWorkouts();
    console.log(workouts);
    if (localUserSplit) {
      setEditableSplitName(localUserSplit.name);
    }
  }, [localUserSplit]);

  useEffect(() => {
    if (editableWorkouts.length > 0) {
      const names = editableWorkouts.map((w) => w.name);
      setEditableWorkoutNames(names);
    }
  }, [editableWorkouts]);

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
    /* Displaying split name */
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 mt-10 justify-center items-center">
      {splitNameIsEdit ? (
        <div className="flex gap-5 items-center justify-center">
          <input
            value={editableSplitName}
            onChange={(e) => setEditableSplitName(e.target.value)}
            className="flex-1 text-center p-3 border text-3xl border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <i
            onClick={() => {
              setSplitNameIsEdit(false);
              handleEditSplitName(editableSplitName);
            }}
            className="fa-solid fa-circle-check text-3xl cursor-pointer text-green-500 py-3 hover:text-green-600 transition"
          ></i>
        </div>
      ) : (
        <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-gray-200 flex gap-5">
          {localUserSplit?.name}
          <i
            className="fa-solid fa-pencil text-2xl cursor-pointer"
            onClick={() => {
              setSplitNameIsEdit(true);
            }}
          ></i>
        </h1>
      )}

      {/* Mapping out workouts */}

      {editableWorkouts.map((workout, workoutIndex) => {
        return (
          <div
            key={workout.workout_id}
            className="w-full min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            {workoutNameIsEdit ? (
              <div className="flex gap-5 items-center justify-center">
                <input
                  value={editableWorkoutNames[workoutIndex] || ""}
                  onChange={(e) => {
                    const newNames = [...editableWorkoutNames];
                    newNames[workoutIndex] = e.target.value;
                    setEditableWorkoutNames(newNames);
                  }}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <i
                  onClick={() => {
                    setWorkoutNameIsEdit(false);
                    applyWorkoutNameChanges();
                  }}
                  className="fa-solid fa-circle-check text-3xl cursor-pointer text-green-500 py-3 hover:text-green-600 transition"
                ></i>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex gap-2 justify-center">
                {editableWorkoutNames[workoutIndex] || ""}
                <i
                  className="fa-solid fa-pencil text-sm cursor-pointer"
                  onClick={() => setWorkoutNameIsEdit(true)}
                ></i>
              </h1>
            )}

            {/* Mapping out exercises */}
            {workout.exercises.map((exercise, exerciseIndex) => {
              return (
                <div key={exerciseIndex}>
                  <div className="mb-6">
                    <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Exercise {exerciseIndex + 1}
                    </h2>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => {
                          handleExercisesFilter(
                            exerciseIndex,
                            workoutIndex,
                            e.target.value
                          );
                          handleChangeExercise(
                            exerciseIndex,
                            workoutIndex,
                            e.target.value
                          );
                        }}
                        className="flex-1 mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      {activeDropdown === `${workoutIndex}-${exerciseIndex}` &&
                        filteredExercises.length > 0 && (
                          <SuggestionDropdown
                            ref={dropdownref}
                            data={filteredExercises}
                            handleClickDropdown={(exerciseName) =>
                              handleClickDropdown(
                                exerciseIndex,
                                workoutIndex,
                                exerciseName
                              )
                            }
                          />
                        )}
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
          type="button"
          className="w-1/2 bg-green-500 text-white py-3 rounded-lg ml-2 hover:bg-green-600 transition"
        >
          Save Split
        </button>
      </div>
    </div>
  );
}
