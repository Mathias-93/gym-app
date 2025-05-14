import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";
import { useNavigate, Link } from "react-router";

export default function History() {
  const {
    showSpinner,
    setIsLoading,
    isAuthenticated,
    isLoadingAuth,
    userSplit,
    fetchUserSplit,
    isLoading,
  } = useContext(GlobalContext);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [splitHistoryData, setSplitHistoryData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoadingAuth) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserSplit();
    }
  }, [isAuthenticated]);

  const handleFetchLogsHistory = async () => {
    if (!selectedSplit) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:1337/log/history/${selectedSplit.split_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
      }

      const data = await response.json();

      if (data?.length > 0) {
        setSplitHistoryData(data);
      } else {
        setSplitHistoryData(null);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchLogsHistory();
  }, [selectedSplit]);

  if (showSpinner) {
    return <Spinner />;
  }
  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
      <div className="w-full max-w-md">
        <label
          htmlFor="split-select"
          className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200"
        >
          Choose a split:
        </label>
        <select
          id="split-select"
          value={selectedSplit?.split_id || ""}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const split = userSplit.find(
              (split) => split.split_id === selectedId
            );
            if (split) setSelectedSplit(split);
          }}
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            -- Select a split --
          </option>
          {userSplit?.map((split, index) => (
            <option key={index} value={split.split_id}>
              {split.name}
            </option>
          ))}
        </select>
        {splitHistoryData?.length > 0 ? (
          <div className="mt-6 space-y-4">
            {splitHistoryData.map((dataEntry, index) => (
              <button
                key={index}
                onClick={() => navigate(`/historyspecific/${dataEntry.log_id}`)}
                className="w-full text-left p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {console.log(splitHistoryData)}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {dataEntry.workout_name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(dataEntry.completed_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 w-full max-w-md p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              No workout history found for this split yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
