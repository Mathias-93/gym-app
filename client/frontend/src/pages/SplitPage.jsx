import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import { useNavigate, useParams } from "react-router";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { toast } from "react-hot-toast";
import CustomToast from "../components/CustomToast";
import CustomModal from "../components/CustomModal";
import Spinner from "../components/Spinner";

export default function SplitPage() {
  const {
    userSplit,
    fetchUserSplit,
    setIsLoading,
    exercises,
    showModal,
    setShowModal,
    showSpinner,
    editableWorkouts,
    setEditableWorkouts,
    fetchWorkouts,
  } = useContext(GlobalContext);
  const [localUserSplit, setLocalUserSplit] = useState(null);
  const [searchParam, setSearchParam] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [splitNameIsEdit, setSplitNameIsEdit] = useState(false);
  const [editableSplitName, setEditableSplitName] = useState("");
  const [editableWorkoutNamesAndIsEdit, setEditableWorkoutNamesAndIsEdit] =
    useState([{ name: "", isEdit: false }]);

  const { splitId } = useParams();

  const dropdownref = useClickOutsideAndEscape(() => {
    setActiveDropdown(null);
    setFilteredExercises([]);
  });

  const navigate = useNavigate();

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
    setEditableWorkouts((prev) => [
      ...prev,
      {
        is_custom: true,
        name: "New Workout",
        exercises: [
          { name: "Example exercise" },
          { name: "Example exercise" },
          { name: "Example exercise" },
        ],
      },
    ]);
  };

  const validateSplitBeforeSaving = () => {
    // Split name is not empty
    if (editableSplitName.trim().length === 0) {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="You must give your split a name!"
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      return false;
    }
    // Split has no more than 12 workouts
    // Split has at least one workout
    if (editableWorkouts.length === 0 || editableWorkouts.length > 12) {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Split must have at least one workout and no more than 12 workouts."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      return false;
    }

    const hasDuplicateNames = (workouts) => {
      const names = new Set();

      for (let workout of workouts) {
        const trimmed = workout.name.trim().toLowerCase();
        if (names.has(trimmed)) return true;
        names.add(trimmed);
      }
      return false;
    };

    // Each workout has a name
    // Each workout has at least one exercise
    // All exercises have non-empty names and the name isn't the example name (it's been edited)
    const isValidWorkout = (workout) => {
      return (
        typeof workout.name === "string" &&
        workout.name.trim().length > 0 &&
        Array.isArray(workout.exercises) &&
        workout.exercises.length > 0 &&
        workout.exercises.every(
          (exercise) =>
            typeof exercise.name === "string" &&
            exercise.name.trim().length > 0 &&
            exercise.name.trim() !== "Example exercise"
        )
      );
    };

    const workoutIsValid = editableWorkouts.every(isValidWorkout);
    const workoutHasDuplicateNames = hasDuplicateNames(editableWorkouts);

    if (!workoutIsValid || workoutHasDuplicateNames) {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Each workout must have a name and at least one exercise with a valid, unique name."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      return false;
    }

    return true;
  };

  const handleSaveSplitToDb = async (editableWorkouts) => {
    if (!validateSplitBeforeSaving()) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:1337/plan/update_split/${splitId}`,
        {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            name: editableSplitName,
            workouts: editableWorkouts,
            numberOfDays: editableWorkouts.length,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.custom(
          (t) =>
            t.visible && (
              <CustomToast t={t} message="Something went wrong." type="error" />
            ),
          { duration: 5000, position: "top-center" }
        );
        throw new Error(`Something went wrong: ${response.statusText}`);
      }

      const data = await response.json();
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast t={t} message="Split saved!" type="success" />
          ),
        { duration: 5000, position: "top-center" }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("Couldn't save to db:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSplit = async (splitId) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:1337/plan/delete_split/${splitId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.custom(
          (t) =>
            t.visible && (
              <CustomToast
                t={t}
                message="Error, could not delete split."
                type="error"
              />
            ),
          { duration: 5000, position: "top-center" }
        );
        throw new Error(`Something went wrong: ${response.statusText}`);
      }

      const data = await response.json();
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Split successfully deleted!"
              type="success"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      navigate("/dashboard");
    } catch (err) {
      console.log("Could not delete split:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localUserSplit === null) {
      setIsLoading(true);
    }
  }, []);

  useEffect(() => {
    if (!userSplit || userSplit.length === 0) {
      fetchUserSplit();
    } else {
      const match = userSplit.find(
        (split) => split.split_id.toString() === splitId
      );
      setLocalUserSplit(match);
    }
  }, [userSplit, splitId]);

  useEffect(() => {
    fetchWorkouts(splitId);

    if (localUserSplit) {
      setEditableSplitName(localUserSplit.name);
    }
  }, [localUserSplit]);

  useEffect(() => {
    if (editableWorkouts.length > 0) {
      setEditableWorkoutNamesAndIsEdit((prev) => {
        return editableWorkouts.map((w, index) => ({
          name: w.name,
          isEdit: prev[index]?.isEdit ?? false,
        }));
      });
    }
  }, [editableWorkouts]);

  if (showSpinner || !localUserSplit) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <CustomModal
            buttonColors={
              "bg-red-500 dark:bg-red-800 text-white py-3 hover:bg-red-400 dark:hover:bg-red-700"
            }
            confirmMessage={"delete this split?"}
            secondMessage={"This action cannot be undone."}
            confirmButton={"Delete"}
            onCancel={() => setShowModal(false)}
            onConfirm={() => {
              handleDeleteSplit(splitId);
              setShowModal(false);
            }}
          />
        </div>
      )}
      {splitNameIsEdit ? (
        <div className="flex gap-5 items-center justify-center mt-52 mb-10">
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
        <h1 className="text-3xl mid:text-5xl font-bold text-center text-gray-800 dark:text-gray-200 flex gap-5 mt-52 mb-10">
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
            key={workoutIndex}
            className="w-full mb-10 mid:min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-2 md:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="relative mb-6">
              <button
                onClick={() => removeWorkout(workoutIndex)}
                className="absolute top-0 right-0 mid:top-0 mid:right-0 m-1 w-6 h-6 flex items-center justify-center rounded transition"
              >
                <i className="fa-solid fa-xmark text-2xl text-red-700 hover:text-red-400 transition"></i>
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
                        className="flex-1 mt-2 p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 text-sm md:text-lg dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                        className="mt-2 w-8 h-8 flex items-center justify-center rounded transition"
                      >
                        <i className="fa-solid fa-xmark text-2xl text-red-700 hover:text-red-400 transition"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addExercise(workoutIndex)}
              className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-600 transition"
            >
              + Add Exercise
            </button>
          </div>
        );
      })}
      <div className="flex flex-col justify-center mt-8 gap-8 w-full max-w-3xl">
        <div className="w-full">
          <button
            type="button"
            className="w-full bg-blue-500 text-white py-3 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-600 transition"
            onClick={addWorkout}
          >
            + Add Workout
          </button>
        </div>

        <div className="flex font-semibold flex-col sm:flex-row justify-between gap-4 w-full">
          <button
            type="button"
            className="w-full sm:w-1/2 bg-green-500 text-white py-3 rounded-lg dark:bg-green-600 dark:hover:bg-green-500 hover:bg-green-600 transition"
            onClick={() => handleSaveSplitToDb(editableWorkouts)}
          >
            Save Changes
          </button>
          <button
            type="button"
            className="w-full font-semibold sm:w-1/2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white py-3 rounded-lg transition"
            onClick={() => {
              setShowModal(!showModal);
            }}
          >
            Delete Split
          </button>
        </div>
      </div>
    </div>
  );
}
