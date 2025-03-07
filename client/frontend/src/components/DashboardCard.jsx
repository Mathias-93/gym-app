import React from "react";

export default function DashboardCard({ children }) {
  return (
    <div className="w-[90%] h-[80%] flex rounded shadow-lg flex-col p-4 border">
      {children}
    </div>
  );
}
