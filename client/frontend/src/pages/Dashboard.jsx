import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { useNavigate } from "react-router";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  const {
    isAuthenticated,
    isLoadingAuth,
    userInformation,
    isLoading,
    setIsLoading,
    userSplit,
    setUserSplit,
  } = useContext(GlobalContext);
  const navigate = useNavigate();

  const fetchUserSplit = async () => {
    console.log("Is running");
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:1337/plan/workout_splits",
        {
          method: "GET",
          credentials: "include",
        }
      );
      console.log(response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data); // Log the fetched data
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

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }
  console.log(userSplit);
  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px]">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
        Welcome back, {userInformation?.username}! {userSplit.name}
      </h1>

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Upcoming Workout
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {userSplit?.name ? (
              <button
                onClick={() => navigate(`/workout/${userSplit?.name}`)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {userSplit?.name}
              </button>
            ) : (
              "No upcoming workout"
            )}
          </p>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Previous Workouts
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            {/* Placeholder: Replace with mapped previous workouts */}
            <li>
              <button
                onClick={() => navigate("/workout/history/1")}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Last Workout
              </button>
            </li>
          </ul>
          <button
            onClick={() => navigate("/workout/history")}
            className="mt-4 text-sm text-gray-500 hover:underline"
          >
            View full history →
          </button>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Weekly Summary
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
        </DashboardCard>
        <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            My training splits
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{userSplit?.name}</p>
        </DashboardCard>
      </div>
    </div>
  );
}
