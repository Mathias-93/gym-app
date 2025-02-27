import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { isAuthenticated } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      alert("Please login to access dashboard!");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <h1 className="text-2xl ">Dashboard baby!</h1>
    </div>
  );
}
