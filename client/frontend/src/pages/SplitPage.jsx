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
  const [editableWorkoutNamesAndIsEdit, setEditableWorkoutNamesAndIsEdit] =
    useState([{ name: "", isEdit: false }]);

  const dropdownref = useClickOutsideAndEscape(() => {
    setActiveDropdown(null);
    setFilteredExercises([]);
  });

  /* const applyWorkoutChanges = (indexToUpdate) => {
    setEditableWorkouts((prev) =>
      prev.map((workout, index) => ({
        ...workout,
        name: editableWorkoutNamesAndIsEdit[index].name,
      }))
    );
  }; */

  const applyWorkoutChanges = (indexToUpdate, updatedName) => {
    setEditableWorkouts((prev) =>
      prev.map((workout, index) =>
        index === indexToUpdate ? { ...workout, name: updatedName } : workout
      )
    );
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

  const addExercise = (workoutIndex) => {
    setEditableWorkouts((prev) =>
      prev.map((workout, index) => {
        if (workoutIndex === index) {
          return {
            ...workout,
            exercises: [...workout.exercises, { name: "" }],
          };
        }
        return workout;
      })
    );
  };

  const removeExercise = (workoutIndex, exerciseIndex) => {
    setEditableWorkouts((prev) =>
      prev.map((workout, index) => {
        if (index === workoutIndex) {
          return {
            ...workout,
            exercises: workout.exercises.filter(
              (_, index) => index !== exerciseIndex
            ),
          };
        } else {
          return workout;
        }
      })
    );
  };

  const removeWorkout = (workoutIndex) => {
    setEditableWorkouts((prev) => {
      return prev.filter((_, index) => index !== workoutIndex);
    });

    setEditableWorkoutNamesAndIsEdit((prev) =>
      prev.filter((_, index) => index !== workoutIndex)
    );
  };

  const addWorkout = () => {
    setEditableWorkoutNamesAndIsEdit((prev) => [
      ...prev,
      { name: "", isEdit: false },
    ]);
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

    if (localUserSplit) {
      setEditableSplitName(localUserSplit.name);
    }
  }, [localUserSplit]);

  useEffect(() => {
    if (editableWorkouts.length > 0) {
      setEditableWorkoutNamesAndIsEdit((prev) => {
        return editableWorkouts.map((w, i) => ({
          name: w.name,
          isEdit: prev[i]?.isEdit ?? false, // preserve existing isEdit state if possible
        }));
      });
    }
  }, [editableWorkouts]);

  /* useEffect(() => {
    if (editableWorkouts.length > 0) {
      const newValues = editableWorkouts.map((w) => ({
        name: w.name,
        isEdit: false,
      }));
      setEditableWorkoutNamesAndIsEdit(newValues);
    }
    console.log("editable workouts:", editableWorkouts);
  }, [editableWorkouts, editableWorkoutNamesAndIsEdit.length]); */

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
              setEditableSplitName(editableSplitName);
            }}
            className="fa-solid fa-circle-check text-3xl cursor-pointer text-green-500 py-3 hover:text-green-600 transition"
          ></i>
        </div>
      ) : (
        <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-gray-200 flex gap-5">
          {editableSplitName}
          <i
            className="fa-solid fa-pencil text-2xl cursor-pointer"
            onClick={() => {
              setSplitNameIsEdit(true);
            }}
          ></i>
        </h1>
      )}

      {/* Mapping out workouts */}

      {editableWorkouts?.map((workout, workoutIndex) => {
        return (
          <div
            key={workout.workout_id}
            className="w-full min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="relative mb-6">
              <button
                onClick={() => removeWorkout(workoutIndex)}
                className="absolute top-0 right-0 m-1 w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            {editableWorkoutNamesAndIsEdit[workoutIndex]?.isEdit ? (
              <div className="flex gap-5 items-center justify-center mb-6">
                <input
                  value={
                    editableWorkoutNamesAndIsEdit[workoutIndex]?.name || ""
                  }
                  onChange={(e) => {
                    const newNames = [...editableWorkoutNamesAndIsEdit];
                    newNames[workoutIndex].name = e.target.value;
                    setEditableWorkoutNamesAndIsEdit(newNames);
                  }}
                  className="w-2/3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <i
                  onClick={() => {
                    const newArray = [...editableWorkoutNamesAndIsEdit];
                    newArray[workoutIndex].isEdit = false;
                    setEditableWorkoutNamesAndIsEdit(newArray);
                    applyWorkoutChanges(
                      workoutIndex,
                      newArray[workoutIndex].name
                    );
                  }}
                  className="fa-solid fa-circle-check text-3xl cursor-pointer text-green-500 py-3 hover:text-green-600 transition"
                ></i>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex gap-2 justify-center mb-6">
                {editableWorkoutNamesAndIsEdit[workoutIndex]?.name || ""}
                <i
                  className="fa-solid fa-pencil text-sm cursor-pointer"
                  onClick={() => {
                    const newArray = [...editableWorkoutNamesAndIsEdit];
                    newArray[workoutIndex].isEdit = true;
                    setEditableWorkoutNamesAndIsEdit(newArray);
                  }}
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
                    <div className="flex items-center space-x-3 relative">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => {
                          handleExercisesFilter(
                            workoutIndex,
                            exerciseIndex,
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
                            ref={
                              activeDropdown ===
                              `${workoutIndex}-${exerciseIndex}`
                                ? dropdownref
                                : null
                            }
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
                      <button
                        type="button"
                        onClick={() =>
                          removeExercise(workoutIndex, exerciseIndex)
                        }
                        className="mt-2 w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                      >
                        <i className="fa-solid fa-xmark text-xl"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addExercise(workoutIndex)} // <-- you'll hook this up
              className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              + Add Exercise
            </button>
          </div>
        );
      })}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          className=" bg-green-500 text-white p-4 rounded-lg ml-2 hover:bg-green-600 transition"
        >
          Save Split
        </button>
      </div>
    </div>
  );
}
