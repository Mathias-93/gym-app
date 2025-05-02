import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";
import { useParams } from "react-router";

export default function LogPage() {
  const { workouts, showSpinner, fetchWorkouts } = useContext(GlobalContext);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [logData, setLogData] = useState(() => {
    // Try loading from localStorage on init
    const saved = localStorage.getItem("logDraft");
    return saved ? JSON.parse(saved) : null;
  });
  const [sets, setSets] = useState([[]]);
  const [notes, setNotes] = useState({});
  const [hasHydrated, setHasHydrated] = useState(false);
  const { splitId } = useParams();

  const handleSubmit = async () => {
    // send to backend...
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
    if (logData && workouts.length > 0 && !hasHydrated) {
      setSets(logData.sets || [[]]);
      setNotes(logData.notes || {});
      const foundWorkout = workouts.find(
        (w) => w.workout_id === logData.workoutId
      );
      if (foundWorkout) {
        setSelectedWorkout(foundWorkout);
      }
      setHasHydrated(true);
    }
  }, [logData, workouts, hasHydrated]);

  useEffect(() => {
    fetchWorkouts(splitId);
  }, []);

  useEffect(() => {
    if (logData) {
      localStorage.setItem("logDraft", JSON.stringify(logData));
    }
  }, [logData]);

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
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
              <div key={setIndex} className="grid grid-cols-3 gap-4 mb-2">
                <input
                  type="number"
                  placeholder="Reps"
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
                <input
                  type="number"
                  placeholder="Weight"
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
                <button
                  onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={() => handleAddSet(exerciseIndex)}
              className="text-sm text-blue-500 hover:text-blue-700 mt-2"
            >
              + Add Set
            </button>

            <textarea
              placeholder="Notes (optional)"
              value={notes[exerciseIndex] || ""}
              onChange={(e) => handleChangeNotes(exerciseIndex, e.target.value)}
              className="w-full mt-4 p-2 rounded border dark:bg-gray-700 dark:text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
