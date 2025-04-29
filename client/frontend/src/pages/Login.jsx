import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../Context";

export default function Login() {
  const [isRegistered, setIsRegistered] = useState(true);
  const {
    userInformation,
    setUserInformation,
    isAuthenticated,
    setIsAuthenticated,
    showSpinner,
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const handleLoginUser = async () => {
    try {
      const response = await fetch("http://localhost:1337/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInformation.email,
          password: userInformation.password,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUserInformation({
        ...userInformation,
        username: data.user.username,
        email: data.user.email,
      });
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to login. Please check your credentials.");
      console.error("Login Error:", err.message);
    }
  };

  const handleRegisterUser = async () => {
    try {
      const response = await fetch("http://localhost:1337/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInformation.email,
          password: userInformation.password,
          username: userInformation.username,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUserInformation({
        ...userInformation,
        username: data.user.username,
        email: data.user.email,
        password: "",
      });
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to register. Please try again.");
      console.error(err.message);
    }
  };

  const handleAuthenticateUser = (e) => {
    e.preventDefault();
    isRegistered ? handleLoginUser() : handleRegisterUser();
  };

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 pt-[250px]">
      <div className="w-[400px] bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {isRegistered ? "Log in" : "Register an Account"}
          </h2>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleAuthenticateUser}>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Email:
            </label>
            <input
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="example@gmail.com"
              value={userInformation.email || ""}
              onChange={(e) =>
                setUserInformation((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Password:
            </label>
            <input
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="•••••••••"
              value={userInformation.password || ""}
              onChange={(e) =>
                setUserInformation((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
          </div>

          {!isRegistered && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                Username:
              </label>
              <input
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="GymBroMan"
                value={userInformation.username || ""}
                onChange={(e) =>
                  setUserInformation((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-500 transition-all"
            type="submit"
          >
            {isRegistered ? "Log in" : "Sign up"}
          </button>
        </form>

        {/* Switch between Login/Register */}
        <div className="text-center mt-4 text-gray-700 dark:text-gray-300">
          {isRegistered ? (
            <p>
              Not yet registered?{" "}
              <span
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                onClick={() => setIsRegistered(false)}
              >
                Sign up here
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                onClick={() => setIsRegistered(true)}
              >
                Log in here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
