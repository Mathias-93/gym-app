import { useContext, useEffect, useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import NavHeader from "./components/NavHeader";
import Dashboard from "./pages/Dashboard";
import { GlobalContext } from "./Context";
import AddNewSplit from "./pages/AddNewSplit";
import LogPage from "./pages/LogPage";
import SplitPage from "./pages/SplitPage";
import { Toaster } from "react-hot-toast";
import History from "./pages/History";
import HistorySpecific from "./pages/HistorySpecific";
import PrsAndGoals from "./pages/PrsAndGoals";
import Goals from "./pages/Goals";

function App() {
  const {
    setIsAuthenticated,
    isAuthenticated,
    setUserInformation,
    userInformation,
    setIsLoadingAuth,
    isLoadingAuth,
    isLoading,
    setIsLoading,
    exercises,
    setExercises,
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:1337/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserInformation(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.log(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setIsLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:1337/exercises", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (err) {
      console.log("Error fetching exercises:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth().then(() => {
      if (isAuthenticated) {
        fetchExercises();
      }
    });
  }, [isAuthenticated]);

  return (
    <div className="bg-slate-100 dark:bg-gray-900">
      {/* Toast container */}
      <Toaster position="top-center" reverseOrder={false} />

      <NavHeader />
      <div className="bg-slate-100 dark:bg-gray-900 flex justify-center">
        <Routes>
          {/* Probably add the landing page here at "/" */}
          <Route exact path="/" element={<Login />} />{" "}
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/dashboard" element={<Dashboard />} />
          <Route exact path="/prsandgoals" element={<PrsAndGoals />} />
          <Route exact path="/goals" element={<Goals />} />
          <Route exact path="/history" element={<History />} />
          <Route
            exact
            path="/historyspecific/:logId"
            element={<HistorySpecific />}
          />
          <Route exact path="/newsplit" element={<AddNewSplit />} />
          <Route path="/split/:splitId" element={<SplitPage />} />
          <Route path="/logpage/:splitId" element={<LogPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
