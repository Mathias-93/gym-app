import React, { useContext } from "react";
import { GlobalContext } from "../Context";

export default function CustomModal() {
  const { showModal, setShowModal } = useContext(GlobalContext);

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          Are you sure you want to delete this split?
        </h2>
        <p className="mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-200 dark:text-gray-800 hover:bg-gray-300 rounded"
            onClick={() => setShowModal(!showModal)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
            onClick={() => setShowModal(!showModal)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
