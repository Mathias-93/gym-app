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
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 tracking-tight">
        Welcome back,{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {userInformation?.username}
        </span>
        !
      </h1>
      {userSplit?.name && (
        <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-2">
          Active split: <span className="font-semibold">{userSplit.name}</span>
        </p>
      )}

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 border shadow-blue-500/20 dark:shadow-blue-500/20 hover:shadow-blue-500/40 dark:hover:shadow-blue-500/40">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
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
        <DashboardCard className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 border shadow-blue-500/20 dark:shadow-blue-500/20 hover:shadow-blue-500/40 dark:hover:shadow-blue-500/40">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            Log workout from training split
          </h2>
          {userSplit?.map((split) => (
            <p
              key={split.split_id}
              className="text-gray-600 w-fit dark:text-gray-300 cursor-pointer hover:text-gray-400 dark:hover:text-gray-600"
              onClick={() => navigate(`/logpage/${split.split_id}`)}
            >
              {split.name}
            </p>
          ))}
        </DashboardCard>
        <DashboardCard className="hover:scale-[1.02] transform bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 border-blue-300 dark:border-blue-700 border shadow-blue-400/30 dark:shadow-blue-500/20 hover:shadow-blue-500/40 dark:hover:shadow-blue-500/40 transition-all duration-300">
          <div className="flex w-full h-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-semibold text-black dark:text-blue-100">
                Add New Split
              </h2>
              <Link to={"/newsplit"}>
                <i className="fa-solid fa-circle-plus text-5xl text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors drop-shadow-md"></i>
              </Link>
            </div>
          </div>
        </DashboardCard>
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
