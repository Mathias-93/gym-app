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
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:1337/plan/workout_splits",
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserSplit(data[0]);
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
    fetchUserSplit();
  }, []);

  if (isLoadingAuth) {
    return (
      <div>
        <h1 className="text-2xl ">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-3xl text-center">
        Welcome back {userInformation?.username}!
      </h1>
      <div className="w-full h-full p-4 grid grid-cols-2 items-center">
        <DashboardCard>
          <h2>
            Upcoming workouts in{" "}
            <span className="font-semibold">{userSplit?.name}</span>
          </h2>

          <p>Next workout: </p>
        </DashboardCard>
        <DashboardCard>
          <h2>Previous workouts</h2>
          <p>Exercises</p>
        </DashboardCard>
        <DashboardCard>
          <h2>Weekly summary</h2>
          <ul>
            <p>workout 1</p>
            <p>workout 2</p>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
