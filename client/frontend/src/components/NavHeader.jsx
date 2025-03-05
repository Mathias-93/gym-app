import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../Context";

export default function NavHeader() {
  const {
    isAuthenticated,
    isLoadingAuth,
    setIsAuthenticated,
    setUserInformation,
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      console.log("Logout");
      const response = await fetch("http://localhost:1337/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }
      setIsAuthenticated(false);
      setUserInformation({
        email: "",
        password: "",
        username: "",
      });
      navigate("/login");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <div className="w-screen h-[100px] p-10 blue-gradient-custom flex items-center justify-center">
        <h1 className="text-4xl text-slate-100 font-semibold text-center">
          Gym app
        </h1>
      </div>
      {!isLoadingAuth && (
        <ul className="flex bg-slate-100 gap-5 px-6 items-center justify-between">
          <Link to={"/"}>
            <li className="text-slate-600 text-2xl font-semibold">Home</li>
          </Link>
          {!isAuthenticated && (
            <Link to="/login">
              <li className="text-slate-600 text-2xl font-semibold">Login</li>
            </Link>
          )}
          {isAuthenticated && (
            <div className="w-full flex justify-between p-2">
              <Link to="/dashboard">
                <li className="text-slate-600 text-2xl font-semibold">
                  Overview
                </li>
              </Link>

              <li className="text-slate-600 text-2xl font-semibold">
                <button onClick={logoutUser}>Log out</button>
              </li>
            </div>
          )}
        </ul>
      )}
    </>
  );
}
