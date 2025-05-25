import React, { useContext } from "react";
import { GlobalContext } from "../Context";

export default function CustomModal({
  onCancel,
  onConfirm,
  confirmMessage,
  secondMessage,
  confirmButton,
  buttonColors,
}) {
  const { showModal, setShowModal, isLoading } = useContext(GlobalContext);

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          Are you sure you want to {confirmMessage}
        </h2>
        <p className="mb-6">{secondMessage}</p>
        <div className="flex justify-end gap-4">
          <button
            className="w-full sm:w-1/2 bg-gray-200 dark:text-gray-800 text-black py-3 rounded-lg hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`w-full sm:w-1/2 rounded-lg ${buttonColors} transition cursor-pointer`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
