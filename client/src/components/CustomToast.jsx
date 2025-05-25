import { useEffect } from "react";

export default function CustomToast({ t, message, type }) {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center ring-1 ring-black ring-opacity-5 p-4`}
    >
      <div className="mr-3 text-2xl">{type === "success" ? "✅" : "⛔"}</div>
      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
        {message}
        <div className="h-1 bg-blue-500 animate-progress mt-2 rounded" />
      </div>
    </div>
  );
}
