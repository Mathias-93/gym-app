import React from "react";
import { createContext, useEffect, useState } from "react";
import { BASE_URL } from "../src/api/config";

export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userInformation, setUserInformation] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [userSplit, setUserSplit] = useState([]);
  const [customUserSplit, setCustomUserSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [editableWorkouts, setEditableWorkouts] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const fetchUserSplit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/plan/workout_splits`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("Fetched data:", data); // Log the fetched data
        setUserSplit(data);
      } else {
        console.error("Fetch failed with status:", response.status);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkouts = async (splitId) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/plan/split/${splitId}/full`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setWorkouts(data);
        setEditableWorkouts(structuredClone(data));
      } else {
        console.error("Fetch failed with status:", response.status);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowSpinner(true);
      }, 1000);
    } else {
      setShowSpinner(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, isLoadingAuth]);

  return (
    <GlobalContext.Provider
      value={{
        userInformation,
        setUserInformation,
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        setIsLoadingAuth,
        userSplit,
        setUserSplit,
        isLoading,
        setIsLoading,
        exercises,
        setExercises,
        customUserSplit,
        setCustomUserSplit,
        fetchUserSplit,
        showModal,
        setShowModal,
        showSpinner,
        setShowSpinner,
        workouts,
        setWorkouts,
        editableWorkouts,
        setEditableWorkouts,
        fetchWorkouts,
        showInfoModal,
        setShowInfoModal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
