import React from "react";
import { useContext } from "react";
import { GlobalContext } from "../Context";

export default function InfoModal({ message, subMessage, onClick }) {
  const { showInfoModal, setShowInfoModal, isLoading } =
    useContext(GlobalContext);

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">{message}</h2>
        <p className="mb-6">{subMessage}</p>
        <div className="flex justify-center gap-4">
          <button
            className="w-full sm:w-1/2 bg-gray-200 dark:text-gray-800 text-black py-3 rounded-lg hover:bg-gray-300 transition"
            onClick={onClick}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
