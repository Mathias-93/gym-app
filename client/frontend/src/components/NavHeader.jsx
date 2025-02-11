import React from "react";
import { Link } from "react-router";

export default function NavHeader() {
  return (
    <div className="w-screen h-[100px] p-5 bg-slate-500 flex justify-between items-center">
      <h1 className="text-2xl text-slate-100 font-semibold">Gym app</h1>
      <ul className="flex gap-2">
        <Link to={"/"}>
          <li className="text-slate-100">Home</li>
        </Link>
        <Link to="/login">
          <li className="text-slate-100">Login</li>
        </Link>
      </ul>
    </div>
  );
}
