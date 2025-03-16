import React from "react";

export default function DashboardCard({ children }) {
  return (
    <div className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:-translate-y-0.5">
      {children}
    </div>
  );
}
