import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { useNavigate } from "react-router";

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
    <div>
      <section id="my-page">
        <h1 className="text-2xl">Welcome back {userInformation?.username}!</h1>
        <div>
          <h2>Upcoming workouts in {userSplit?.name}</h2>
          <p>Next workout: </p>
        </div>
        <div>
          <h2>Previous workouts</h2>
          <p>Exercises</p>
        </div>
        <div>
          <h2>Weekly summary</h2>
          <ul>
            <p>workout 1</p>
            <p>workout 2</p>
          </ul>
        </div>
      </section>
    </div>
  );
}
