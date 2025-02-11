import React, { useState } from "react";

export default function Login() {
  const [isRegistered, setIsRegistered] = useState(true);

  return (
    <div className="w-[400px] h-[450px] bg-slate-500 mt-36 rounded shadow-lg">
      <div className="flex justify-center p-4 w-full bg-slate-800 rounded">
        <h2 className="text-2xl text-slate-50 font-semibold">
          {isRegistered ? "Log in" : "Register an account"}
        </h2>
      </div>
      <form className="flex flex-col items-center">
        <div className="flex flex-col gap-6 mt-7 items-center w-[70%]">
          <div>
            <p className="text-slate-50">Email:</p>
            <input className="p-1 rounded" type="email" />
          </div>
          <div>
            <p className="text-slate-50">Password:</p>
            <input className="p-1 rounded" type="password" />
          </div>
          <button
            className="w-[90px] h-[40px] bg-slate-50 rounded-2xl font-medium hover:scale-105 transition-transform duration-100"
            type="submit"
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
