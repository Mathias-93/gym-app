import { useContext, useEffect, useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import NavHeader from "./components/NavHeader";
import Dashboard from "./pages/Dashboard";
import { GlobalContext } from "./Context";

function App() {
  const {
    setIsAuthenticated,
    isAuthenticated,
    setUserInformation,
    userInformation,
    setIsLoadingAuth,
    isLoadingAuth,
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Is running checkauth");
      try {
        const response = await fetch("http://localhost:1337/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserInformation(data.user);
          setIsAuthenticated(true);
          console.log(userInformation);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log(err.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="bg-slate-100 dark:bg-gray-900">
      <NavHeader />
      <div className="bg-slate-100 dark:bg-gray-900 flex justify-center">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
