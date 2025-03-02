import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { isAuthenticated, isLoadingAuth, loadingAuth } =
    useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoadingAuth) {
      alert("Please login to access dashboard!");
      navigate("/login");
    }
  }, [isAuthenticated, loadingAuth, navigate]);

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="text-2xl ">Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl ">Dashboard baby!</h1>
    </div>
  );
}
