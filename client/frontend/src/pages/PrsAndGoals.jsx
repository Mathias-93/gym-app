import React, { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { GlobalContext } from "../Context";
import Spinner from "../components/Spinner";

export default function PrsAndGoals() {
  const { setIsLoading, showSpinner, exercises } = useContext(GlobalContext);
  const [temporary, setTemporary] = useState(null);
  const [prsData, setPrsData] = useState(null);

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

  if (showSpinner) {
    <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 mt-10 items-center">
      <h1>PrsAndGoals</h1>
      {prsData
        ? prsData.map((pr, index) => {
            return (
              <div key={index}>
                <p>
                  {pr.pr_type} PR for {pr.exercise_name}: {pr.value}
                </p>
              </div>
            );
          })
        : null}
    </div>
  );
}
