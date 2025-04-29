import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { Link, useNavigate } from "react-router";
import DashboardCard from "../components/DashboardCard";
import Spinner from "../components/Spinner";

export default function Dashboard() {
  const {
    isAuthenticated,
    isLoadingAuth,
    userInformation,
    isLoading,
    setIsLoading,
    userSplit,
    setUserSplit,
    fetchUserSplit,
    showSpinner,
    setShowSpinner,
  } = useContext(GlobalContext);
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

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px]">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
        Welcome back, {userInformation?.username}! {userSplit.name}
      </h1>

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Edit my training splits
          </h2>
          {userSplit?.map((split) => {
            return (
              <p
                key={split.split_id}
                className="text-gray-600 w-fit dark:text-gray-300 cursor-pointer hover:text-gray-400 dark:hover:text-gray-600"
                onClick={() => navigate(`/split/${split.split_id}`)}
              >
                {split.name}
              </p>
            );
          })}
        </DashboardCard>
        <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Log workout from training split
          </h2>
          {userSplit?.map((split) => {
            return (
              <p
                key={split.split_id}
                className="text-gray-600 w-fit dark:text-gray-300 cursor-pointer hover:text-gray-400 dark:hover:text-gray-600"
                onClick={() => navigate(`/split/${split.split_id}`)}
              >
                {split.name}
              </p>
            );
          })}
        </DashboardCard>

        <div className="flex items-center justify-between p-6 dark:bg-green-700 bg-green-50 border-green-300 text-green-700 hover:text-green-600 rounded-xl shadow-lg border transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-200">
            Add New Split
          </h2>
          <Link to={"/newsplit"}>
            <i className="fa-solid fa-circle-plus text-4xl text-green-500 dark:text-green-200 hover:text-green-600 transition-colors"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

{
  /*  <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Previous Workouts
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
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
        </DashboardCard> */
}

{
  /* <DashboardCard>
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Weekly Summary
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
        </DashboardCard> */
}
