import React, { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";
import { useLoaderData, useParams } from "react-router";
import CustomModal from "../components/CustomModal";
import { toast } from "react-hot-toast";
import CustomToast from "../components/CustomToast";

export default function LogPage() {
  const {
    workouts,
    showSpinner,
    fetchWorkouts,
    setShowModal,
    showModal,
    isLoading,
    setIsLoading,
  } = useContext(GlobalContext);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [logData, setLogData] = useState(() => {
    const saved = localStorage.getItem("logDraft");
    return saved ? JSON.parse(saved) : null;
  });
  const [sets, setSets] = useState([[]]);
  const [notes, setNotes] = useState({});
  const [hasHydrated, setHasHydrated] = useState(false);
  const { splitId } = useParams();
  const savedDraftRef = useRef(
    (() => {
      const saved = localStorage.getItem("logDraft");
      return saved ? JSON.parse(saved) : null;
    })()
  );

  const validateWorkout = () => {
    // number of sets to be at least one per exercise
    const isValidLength = logData.sets.every(
      (setGroup) => setGroup.length >= 1
    );
    if (!isValidLength) return false;

    // number of reps to be at least 1, and weight a value, even 0 (for body weight stuff)
    const isValidValues = logData.sets.every((setGroup) => {
      return setGroup.every(
        (set) => set.reps > 0 && typeof set.weight === "number"
      );
    });

    if (!isValidValues) return false;

    // Extra guard for notes length
    const isNotesLength = Object.values(logData.notes).every(
      (note) => note.length <= 500
    );

    if (!isNotesLength) return false;

    return true;
  };

  const handleSubmit = async () => {
    /*     console.log("Right before:", logData.sets); */
    if (!validateWorkout()) {
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Each exercise must have at least one set, reps cannot be 0 and weight must be a number."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
      return;
    }
    // send to backend...
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:1337/log/workout/${splitId}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            workoutId: logData.workoutId,
            setsData: logData.sets,
            notes: logData.notes,
            exerciseNamesList: selectedWorkout.exercises.map((ex) => ex.name),
            exerciseIdsList: selectedWorkout.exercises.map(
              (ex) => ex.exercise_id
            ),
          }),
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
    } catch (err) {
      console.log("Something went wrong:", err.message);
      toast.custom(
        (t) =>
          t.visible && (
            <CustomToast
              t={t}
              message="Something went wrong when logging workout."
              type="error"
            />
          ),
        { duration: 5000, position: "top-center" }
      );
    } finally {
      setIsLoading(false);
    }

    localStorage.removeItem("logDraft");
    setLogData(null);
  };

  const handleAddSet = (exerciseIndex) => {
    setSets((prev) => {
      const newSets = structuredClone(prev);
      newSets[exerciseIndex] = [
        ...(prev[exerciseIndex] || []),
        { reps: "", weight: "" },
      ];
      return newSets;
    });
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setSets((prev) => {
      const newSets = structuredClone(prev);
      newSets[exerciseIndex] = prev[exerciseIndex].filter(
        (_, i) => i !== setIndex
      );
      return newSets;
    });
  };

  const handleSetValuesChange = (exerciseIndex, setIndex, field, value) => {
    const valueAsNumber =
      field === "reps" || field === "weight" ? Number(value) : value;
    setSets((prev) => {
      const newSets = structuredClone(prev);
      newSets[exerciseIndex][setIndex][field] = valueAsNumber;
      return newSets;
    });
  };

  const handleChangeNotes = (exerciseIndex, value) => {
    setNotes((prev) => ({
      ...prev,
      [exerciseIndex]: value,
    }));
  };

  useEffect(() => {
    fetchWorkouts(splitId);
  }, []);

  useEffect(() => {
    if (savedDraftRef.current && workouts.length > 0 && !hasHydrated) {
      const { sets, notes, workoutId } = savedDraftRef.current;

      setSets(sets || [[]]);
      setNotes(notes || {});

      const foundWorkout = workouts.find((w) => w.workout_id === workoutId);
      if (foundWorkout) {
        setSelectedWorkout(foundWorkout);
      }
      setHasHydrated(true);
    }
  }, [workouts, hasHydrated]);

  useEffect(() => {
    if (hasHydrated && selectedWorkout) {
      setLogData({
        workoutId: selectedWorkout.workout_id,
        timestamp: new Date().toISOString(),
        sets,
        notes,
      });
    }
  }, [selectedWorkout, sets, notes, hasHydrated]);

  useEffect(() => {
    if (logData) {
      console.log("Setting logDraft:", logData);
      localStorage.setItem("logDraft", JSON.stringify(logData));
    }
  }, [logData]);

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <CustomModal
            buttonColors={"bg-green-500 text-white hover:bg-green-600"}
            confirmMessage={"log the workout?"}
            confirmButton={"Log"}
            onCancel={() => setShowModal(false)}
            onConfirm={() => {
              handleSubmit();
              setShowModal(false);
            }}
          />
        </div>
      )}
      <div className="w-full max-w-md">
        <label
          htmlFor="workout-select"
          className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200"
        >
          Choose a workout:
        </label>
        <select
          id="workout-select"
          value={selectedWorkout?.workout_id || ""}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const workout = workouts.find((w) => w.workout_id === selectedId);
            setSelectedWorkout(workout);
            console.log(selectedWorkout);
          }}
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            -- Select a workout --
          </option>
          {workouts?.map((workout) => (
            <option key={workout.workout_id} value={workout.workout_id}>
              {workout.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {selectedWorkout?.exercises?.map((exercise, exerciseIndex) => (
          <div className="w-full max-w-2xl p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-300 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {exercise.name}
            </h3>

            {sets[exerciseIndex]?.map((set, setIndex) => (
              <div
                key={setIndex}
                className="grid grid-cols-3 gap-4 mb-2 items-center"
              >
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Weight:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={set.weight}
                    onChange={(e) =>
                      handleSetValuesChange(
                        exerciseIndex,
                        setIndex,
                        "weight",
                        e.target.value
                      )
                    }
                    className="p-2 rounded border dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Reps:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={set.reps}
                    onChange={(e) =>
                      handleSetValuesChange(
                        exerciseIndex,
                        setIndex,
                        "reps",
                        e.target.value
                      )
                    }
                    className="p-2 rounded border dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center mt-6">
                  <button
                    onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => handleAddSet(exerciseIndex)}
              className="text-sm text-blue-500 hover:text-blue-700 mt-2"
            >
              + Add Set
            </button>

            <textarea
              placeholder="Notes (max 500 characters)"
              maxLength="500"
              value={notes[exerciseIndex] || ""}
              onChange={(e) => handleChangeNotes(exerciseIndex, e.target.value)}
              className="w-full mt-4 p-2 rounded border dark:bg-gray-700 dark:text-white"
            />
          </div>
        ))}
        <div className="w-full flex flex-col">
          <button
            type="button"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            onClick={() => {
              setShowModal(!showModal);
            }}
          >
            Log workout
          </button>
        </div>
      </div>
    </div>
  );
}
