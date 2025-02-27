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
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  console.log(userInformation);

  const handleLoginUser = async () => {
    console.log("Login");

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
      console.log("Login Success:", data);

      // Update state with user info and authentication status
      setUserInformation({
        ...userInformation,
        username: data.user.username, // Store user info
        email: data.user.email,
      });
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err.message);
      alert("Failed to login. Please check your credentials.");
    }
  };

  const handleRegisterUser = async () => {
    console.log("Register");
    // API request to register user
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

      // If failed to register throw error
      if (!response.ok)
        throw new Error(`Registration failed: ${response.statusText}`);

      const data = await response.json();
      console.log(data);

      setUserInformation({
        ...userInformation,
        username: data.user.username,
        email: data.user.email,
        password: "",
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.log(err.message);
      alert("Failed to register. Please try again.");
    }

    // if successful, set isAuthenticated to true, login and reveal user info

    // else handle showing error message
  };

  const handleAuthenticateUser = () => {
    console.log("Hi!");
    if (!isRegistered) {
      handleRegisterUser();
    } else {
      handleLoginUser();
    }
  };

  return (
    <div className="w-[400px] h-[550px] bg-slate-500 mt-36 rounded shadow-xl">
      <div className="flex justify-center p-4 w-full bg-slate-800 rounded shadow-lg">
        <h2 className="text-2xl text-slate-50 font-semibold">
          {isRegistered ? "Log in" : "Register an account"}
        </h2>
      </div>
      <form className="flex flex-col items-center">
        <div className="flex flex-col gap-6 mt-7 items-center w-[70%]">
          <div>
            <p className="text-slate-50">Email:</p>
            <input
              className="p-1 rounded"
              type="email"
              placeholder="GymBroMan@gmail.com"
              value={userInformation.email || ""}
              onChange={(e) =>
                setUserInformation((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-slate-50">Password:</p>
            <input
              className="p-1 rounded"
              type="password"
              placeholder="•••••••••••••"
              value={userInformation.password || ""}
              onChange={(e) =>
                setUserInformation((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </div>
          {!isRegistered && (
            <div>
              <p className="text-slate-50">Username:</p>
              <input
                className="p-1 rounded"
                type="text"
                placeholder="GymBroMan"
                value={userInformation.username || ""}
                onChange={(e) =>
                  setUserInformation((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
          )}
          <button
            className="w-[90px] h-[40px] bg-slate-50 rounded-2xl font-medium hover:scale-105 transition-transform duration-100"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleAuthenticateUser();
            }}
          >
            {isRegistered ? "Log in" : "Sign up"}
          </button>
          {isRegistered ? (
            <p className="text-slate-50">
              Not yet registered? Register
              <span
                className="underline hover:cursor-pointer hover:text-slate-300 p-1"
                onClick={() => setIsRegistered(!isRegistered)}
              >
                here
              </span>
            </p>
          ) : (
            <p className="text-slate-50 ">
              Already have an account? Login
              <span
                className="underline hover:cursor-pointer hover:text-slate-300 p-1"
                onClick={() => setIsRegistered(!isRegistered)}
              >
                here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
