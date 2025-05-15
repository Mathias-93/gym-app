import React from "react";
import { useEffect } from "react";
import { useState } from "react";

export default function PrsAndGoals() {
  const [prsData, setPrsData] = useState(null);

  const fetchUserPrs = async () => {
    try {
      const response = await fetch("http://localhost:1337/prs/user_pr", {
        method: "GET",
        credentials: "include",
      });

      const data = response.json();
      console.log(data);
      setPrsData(data);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchUserPrs();
  }, []);

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 mt-10 items-center">
      <h1>PrsAndGoals</h1>
    </div>
  );
}
