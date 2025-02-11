import React from "react";
import { Link } from "react-router";

export default function NavHeader() {
  return (
    <div className="w-screen h-[100px] p-10 bg-slate-700 flex justify-between items-center">
      <h1 className="text-4xl text-slate-100 font-semibold">Gym app</h1>
      <ul className="flex gap-5">
        <Link to={"/"}>
          <li className="text-slate-100 text-2xl">Home</li>
        </Link>
        <Link to="/login">
          <li className="text-slate-100 text-2xl">Login</li>
        </Link>
      </ul>
    </div>
  );
}
