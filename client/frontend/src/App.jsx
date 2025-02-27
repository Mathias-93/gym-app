import { useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NavHeader from "./components/NavHeader";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="w-screen h-screen">
      <NavHeader />
      <div className="w-screen h-screen bg-slate-300 flex justify-center">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
