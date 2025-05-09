import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import Spinner from "../components/Spinner";
import { GlobalContext } from "../Context";

export default function HistorySpecific() {
  const { showSpinner, isLoading, setIsLoading } = useContext(GlobalContext);
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

      console.log("Groupies:", groupedExercises);
    });

    setFormattedLogData(groupedExercises);
  };

  const handleFetchLogData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:1337/log/log-history-specific/${logId}`,
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

      console.log("Data:", data);
      console.log("LogData:", logData);
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
      {logData?.length > 0 && (
        <div className="mt-6 space-y-4">
          {logData.map((dataEntry, index) => (
            <button
              key={index}
              onClick={console.log("asdasd")}
              className="w-full text-left p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {dataEntry.exercise_name}
                </span>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Reps: {dataEntry.reps}
                </span>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Weight: {dataEntry.weight}
                </span>
                {dataEntry.notes !== null ? (
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Notes: {dataEntry.notes}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
