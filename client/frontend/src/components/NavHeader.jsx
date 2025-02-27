import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "../Context";

export default function NavHeader() {
  const { isAuthenticated } = useContext(GlobalContext);

  return (
    <div className="w-screen h-[100px] p-10 bg-slate-700 flex justify-between items-center">
      <h1 className="text-4xl text-slate-100 font-semibold">Gym app</h1>
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
          <Link to="/dashboard">
            <li className="text-slate-100 text-2xl">Dashboard</li>
          </Link>
        )}
      </ul>
    </div>
  );
}
