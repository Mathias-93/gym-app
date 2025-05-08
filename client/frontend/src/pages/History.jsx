import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router";

export default function History() {
  const {
    showSpinner,
    setIsLoading,
    isAuthenticated,
    isLoadingAuth,
    userInformation,
    userSplit,
    fetchUserSplit,
  } = useContext(GlobalContext);
  const [selectedSplit, setSelectedSplit] = useState(null);

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
    try {
      const response = await fetch(`http://localhost:1337/log/history/${asd}`);
    } catch (err) {
      console.log(err.message);
    }
  };

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
            setSelectedSplit(split);
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
      </div>
    </div>
  );
}
