import React, { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";
import SuggestionDropdown from "../components/SuggestionDropdown";
import { useClickOutsideAndEscape } from "../hooks/useClickOutsideAndEscape";

export default function PrsAndGoals() {
  const { setIsLoading, showSpinner, exercises } = useContext(GlobalContext);
  const [temporary, setTemporary] = useState(null);
  const [prsData, setPrsData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [prTypes, setPrTypes] = useState(["weight", "volume"]);
  const dropdownref = useClickOutsideAndEscape(() => {
    setActiveDropdown(null);
    setFilteredExercises([]);
  });
  const [selectedExercises, setSelectedExercises] = useState({});
  const [showFullData, setShowFullData] = useState(false);

  const handleExercisesFilter = (query, type) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.length > 1) {
      const filteredData =
        exercises?.filter((exercise) =>
          exercise.name.toLowerCase().includes(lowerQuery)
        ) || [];

      setFilteredExercises(filteredData);
      setActiveDropdown(type);
    } else {
      setActiveDropdown(null);
    }
  };

  const handleClickDropdown = (exerciseName, type) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [type]: exerciseName,
    }));
    setActiveDropdown(null);
    setFilteredExercises([]);
  };

  const fetchAndShowVolumeSets = async (logId, exerciseId) => {
    try {
      const response = await fetch();
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchUserPrs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:1337/prs/user_prs", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      setTemporary(data);
      setPrsData(data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPrs();
  }, []);

  useEffect(() => {
    if (temporary && exercises?.length > 0) {
      const enrichedPrs = prsData.map((pr) => {
        const matchedExercise = exercises.find(
          (exercise) => exercise.exercise_id === pr.exercise_id
        );

        return {
          ...pr,
          exercise_name: matchedExercise
            ? matchedExercise.name
            : "Unknown exercise",
        };
      });

      setPrsData(enrichedPrs);
    }
  }, [exercises, temporary]);

  console.log(prsData);

  if (showSpinner) {
    <Spinner />;
  }

  return (
    <div className="w-full min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 flex flex-col items-center gap-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-52">
        🏆 Personal Records
      </h1>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {prTypes.map((type, index) => {
          const selectedExerciseName = selectedExercises[type];
          const matchingPr = prsData?.find(
            (pr) =>
              pr.pr_type === type &&
              pr.exercise_name?.toLowerCase() ===
                selectedExerciseName?.toLowerCase()
          );

          return (
            <div
              key={index}
              className=" bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white capitalize">
                {type} PR
              </h2>
              <div className="relative">
                <input
                  type="text"
                  value={selectedExercises[type] || ""}
                  onChange={(e) => {
                    handleExercisesFilter(e.target.value, type);
                    setSelectedExercises((prev) => ({
                      ...prev,
                      [type]: e.target.value,
                    }));
                  }}
                  placeholder="Search for an exercise"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {activeDropdown === type && filteredExercises?.length > 0 && (
                  <SuggestionDropdown
                    ref={dropdownref}
                    data={filteredExercises}
                    handleClickDropdown={(exerciseName) =>
                      handleClickDropdown(exerciseName, type)
                    }
                  />
                )}
              </div>

              {matchingPr ? (
                <div className="mt-6 text-gray-900 dark:text-white">
                  {type === "weight" ? (
                    <p className="text-lg">
                      🏋️‍♂️ <strong>{matchingPr.exercise_name}</strong> —{" "}
                      <span className="font-semibold">
                        {matchingPr.value} kg
                      </span>
                    </p>
                  ) : (
                    <div>
                      <p className="text-lg">
                        📊 <strong>{matchingPr.exercise_name}</strong> —{" "}
                        <span className="font-semibold">
                          {matchingPr.value} kg total
                        </span>
                      </p>
                      <button
                        onClick={() =>
                          fetchAndShowVolumeSets(
                            matchingPr.log_id,
                            matchingPr.exercise_id
                          )
                        }
                        className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                      >
                        View Set Breakdown
                      </button>
                    </div>
                  )}
                </div>
              ) : selectedExerciseName ? (
                <p className="text-sm text-gray-400 mt-4">
                  No PR found for that exercise.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-20 w-full max-w-4xl flex flex-col">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowFullData(!showFullData)}
            className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {showFullData ? "Hide full PR data" : "Show full PR data"}
          </button>
        </div>
        <div className="flex gap-5">
          {showFullData &&
            prTypes.map((type, index) => {
              return (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white capitalize">
                    {type}
                  </h3>
                  <ul className="space-y-4">
                    {prsData
                      ?.filter((pr) => pr.pr_type === type)
                      .map((pr, index) => (
                        <li
                          key={index}
                          className="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm"
                        >
                          <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {pr.exercise_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Type:{" "}
                            <span className="capitalize">{pr.pr_type}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Value: {pr.value}{" "}
                            {pr.pr_type === "weight" ? "kg" : "kg total"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Achieved:{" "}
                            {new Date(pr.achieved_at).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
