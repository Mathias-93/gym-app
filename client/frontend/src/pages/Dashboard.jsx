import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { isAuthenticated, isLoadingAuth } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoadingAuth) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  if (isLoadingAuth) {
    return (
      <div>
        <h1 className="text-2xl ">Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <div></div>
    </div>
  );
}
