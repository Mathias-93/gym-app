import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../Context";
import useTheme from "../hooks/useTheme";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function NavHeader() {
  const {
    isAuthenticated,
    isLoadingAuth,
    setIsAuthenticated,
    setUserInformation,
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  const logoutUser = async () => {
    try {
      const response = await fetch("http://localhost:1337/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }
      setIsAuthenticated(false);
      setUserInformation({ email: "", password: "", username: "" });
      navigate("/login");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 dark:bg-gray-950 shadow-lg z-50">
      {/* Title Bar */}
      <div className="w-full h-20 flex items-center justify-between px-6 relative">
        {/* Empty Spacer (for alignment) */}
        <div className="w-10"></div>

        {/* Centered Title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold text-white tracking-wide">
          The Iron Archives
        </h1>

        {/* Dark Mode Toggle (right-aligned) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-700 dark:bg-gray-600 text-white hover:scale-105 transition-all"
        >
          {theme === "light" ? (
            <MoonIcon className="w-6 h-6" />
          ) : (
            <SunIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      {!isLoadingAuth && (
        <nav className="bg-gray-100 dark:bg-gray-800 shadow-md">
          <ul className="flex items-center justify-between px-8 py-3">
            {/* Home Link */}
            <li>
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                Home
              </Link>
            </li>

            {/* Conditional Auth Links */}
            {!isAuthenticated ? (
              <li>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  Log In
                </Link>
              </li>
            ) : (
              <div className="flex gap-6">
                {/* Dashboard Link */}
                <li className="flex items-center justify-center">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    Dashboard
                  </Link>
                </li>

                {/* Logout Button */}
                <li>
                  <button
                    onClick={logoutUser}
                    className="bg-red-600 text-white text-lg px-4 py-1 rounded-lg hover:bg-red-700 transition-all"
                  >
                    Log Out
                  </button>
                </li>
              </div>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
