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
    <div className="w-screen h-[100px] p-10 bg-slate-700 flex justify-between items-center">
      <h1 className="text-4xl text-slate-100 font-semibold">Gym app</h1>
      {!isLoadingAuth && (
        <ul className="flex gap-5">
          <Link to={"/"}>
            <li className="text-slate-100 text-2xl">Home</li>
          </Link>
          {!isAuthenticated && (
            <Link to="/login">
              <li className="text-slate-100 text-2xl">Login</li>
            </Link>
          )}
          {isAuthenticated && (
            <>
              <Link to="/dashboard">
                <li className="text-slate-100 text-2xl">Dashboard</li>
              </Link>
              <li className="text-slate-100 text-2xl">
                <button onClick={logoutUser}>Logout</button>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
