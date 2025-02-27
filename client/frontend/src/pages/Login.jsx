import React, { useContext, useState } from "react";
import { GlobalContext } from "../Context";

export default function Login() {
  const [isRegistered, setIsRegistered] = useState(true);
  const {
    userInformation,
    setUserInformation,
    isAuthenticated,
    setIsAuthenticated,
  } = useContext(GlobalContext);

  console.log(userInformation);

  const handleLoginUser = () => {
    console.log("Login");
  };

  const handleRegisterUser = () => {
    console.log("Register");
  };

  const handleAuthenticateUser = () => {
    console.log("Hi!");
    if (isAuthenticated) {
      handleLoginUser();
    } else {
      handleRegisterUser();
    }
  };

  return (
    <div className="w-[400px] h-[450px] bg-slate-500 mt-36 rounded shadow-xl">
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
              placeholder="john-smith@email.com"
              value={userInformation.email || ""}
              onChange={(e) =>
                setUserInformation({
                  ...userInformation,
                  email: e.target.value,
                })
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
                setUserInformation({
                  ...userInformation,
                  password: e.target.value,
                })
              }
            />
          </div>
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
