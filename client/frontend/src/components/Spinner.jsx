import React from "react";

export default function Spinner() {
  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px] flex justify-center items-center">
      <div className="opacity-0 animate-fadeIn">
        <svg
          className="animate-spin h-16 w-16 text-gray-400"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <circle
            className="opacity-75"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="60"
            strokeDashoffset="20"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
