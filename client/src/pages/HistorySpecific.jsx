import React from "react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import Spinner from "../components/Spinner";
import { GlobalContext } from "../Context";
import { BASE_URL } from "../api/config";

export default function HistorySpecific() {
  const { showSpinner, setIsLoading } = useContext(GlobalContext);
  const { logId } = useParams();
  const [logData, setLogData] = useState(null);
  const [formattedLogData, setFormattedLogData] = useState();

  const handleFormatLogData = (logData) => {
    let groupedExercises = {};

    logData.forEach((dataEntry) => {
      let exerciseName = dataEntry.exercise_name;
      if (!groupedExercises[exerciseName]) {
        groupedExercises[exerciseName] = [];
      }
      groupedExercises[exerciseName].push(dataEntry);
    });

    setFormattedLogData(groupedExercises);
  };

  const handleFetchLogData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/log/log-history-specific/${logId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Nope`);
      }
      const data = await response.json();
      setLogData(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchLogData();
  }, []);

  useEffect(() => {
    if (logData) handleFormatLogData(logData);
  }, [logData]);

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
      {formattedLogData && (
        <div className="w-full max-w-2xl space-y-6">
          {Object.entries(formattedLogData).map(
            ([exerciseName, sets, completed_at]) => (
              <div
                key={exerciseName}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-300 dark:border-gray-700"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  {exerciseName}
                </h2>

                <ul className="space-y-2">
                  {sets.map((set, index) => (
                    <li
                      key={index}
                      className="text-gray-700 dark:text-gray-200 text-md"
                    >
                      Set {set.set_number}: {set.reps} reps @ {set.weight} kg
                    </li>
                  ))}
                </ul>

                {/* Show notes once, after all sets */}
                {sets[0]?.notes && (
                  <div className="text-md text-gray-500 dark:text-gray-400 mt-4 italic">
                    Notes: {sets[0].notes}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
