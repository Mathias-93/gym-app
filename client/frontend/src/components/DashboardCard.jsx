import React from "react";

export default function DashboardCard({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}
