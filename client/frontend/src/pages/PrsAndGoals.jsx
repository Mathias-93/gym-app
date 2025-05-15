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

  const fetchUserPrs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:1337/prs/user_prs", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      console.log(data);
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

  /* console.log(prsData); */

  if (showSpinner) {
    <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 mt-10 items-center">
      <h1 className="dark:text-white">PRs and Goals</h1>
      <div className="flex gap-10">
        {prTypes.map((type, index) => {
          return (
            <div key={index} className="relative">
              <h2 className="dark:text-white">{type}</h2>
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
                placeholder={"Search for an exercise"}
                className="flex-1 mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              ;
              {activeDropdown === type && filteredExercises?.length > 0 && (
                <SuggestionDropdown
                  ref={dropdownref}
                  data={filteredExercises}
                  handleClickDropdown={(exerciseName) =>
                    handleClickDropdown(exerciseName, type)
                  }
                />
              )}
              {prsData?.map((pr) =>
                pr.pr_type === type &&
                pr.exercise_name === selectedExercises[type] ? (
                  <p className="dark:text-white">
                    Max {type === "weight" ? "weight" : "volume"} lifted for{" "}
                    {pr.exercise_name}: {pr.value}
                  </p>
                ) : null
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
