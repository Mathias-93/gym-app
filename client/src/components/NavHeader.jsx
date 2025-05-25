import React, { useContext, useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="fixed top-0 left-0 w-full bg-gray-800 dark:bg-gray-950 shadow-lg z-50">
      {/* Title Bar */}
      <div className="w-full h-20 flex items-center justify-between px-6 relative">
        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden p-2 text-[1.25rem] text-white rounded ${
            mobileMenuOpen ? "bg-gray-500" : "bg-gray-700"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        {/* Centered Title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-5xl font-extrabold text-white tracking-wider drop-shadow-xl">
          The <span className="text-blue-500 dark:text-blue-400">Bro</span>
          chives
        </h1>

        {/* Dark Mode Toggle (right-aligned) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-700 text-white hover:scale-105 transition-all"
        >
          {theme === "light" ? (
            <MoonIcon className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <SunIcon className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      {!isLoadingAuth && (
        <nav className="bg-gray-100 dark:bg-gray-800 shadow-md">
          <ul
            className={`flex flex-col md:flex-row items-start md:items-center px-6 py-4 gap-4 md:gap-6 transition-all duration-300 ${
              mobileMenuOpen ? "block" : "hidden"
            } md:flex`}
          >
            {!isAuthenticated ? (
              <li>
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  to="/login"
                  className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <button className="bg-blue-600 text-white text-lg px-4 py-1 rounded-lg hover:bg-blue-400 transition-all">
                    Log In
                  </button>
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/prsandgoals"
                    className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    Personal Records
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/goals"
                    className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    Goals
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/history"
                    className="text-gray-700 dark:text-gray-100 text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    History
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logoutUser();
                    }}
                    className="bg-red-800 text-white text-lg px-4 py-1 rounded-lg hover:bg-red-700 transition-all"
                  >
                    Log Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
