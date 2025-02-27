import { useContext, useEffect, useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NavHeader from "./components/NavHeader";
import Dashboard from "./pages/Dashboard";
import { GlobalContext } from "./Context";

function App() {
  const { setIsAuthenticated, setUserInformation, userInformation } =
    useContext(GlobalContext);

  useEffect(() => {
    const checkAuth = async () => {
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
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="w-screen h-screen">
      <NavHeader />
      <div className="w-screen h-screen bg-slate-300 flex justify-center">
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
