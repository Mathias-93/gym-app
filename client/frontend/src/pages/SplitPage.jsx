import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../Context";
import { useParams } from "react-router";

export default function SplitPage() {
  const { splitId } = useParams();
  const { userSplit, setUserSplit, isLoading } = useContext(GlobalContext);

  const currentSplit = userSplit.find(
    (split) => split.split_id.toString() === splitId
  );

  useEffect(() => {
    console.log(currentSplit);
  }, []);

  if (isLoading || !currentSplit) {
    return (
      <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px] flex justify-center">
        <p className="flex justify-center text-center text-gray-500 text-4xl">
          Loading..
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px] flex justify-center">
      <div className="w-full min-w-[500px] max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
          {currentSplit?.name}
        </h1>

        <div className="mb-5">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
            Edit split
          </label>
          <input
            type="text"
            placeholder=""
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Exercise
          </h2>
          {/* {currentSplit.map(() => {
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder=""
                className="flex-1 mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>;
          })} */}
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="w-1/2 bg-green-500 text-white py-3 rounded-lg ml-2 hover:bg-green-600 transition"
          >
            Save Split
          </button>
        </div>
      </div>
    </div>
  );
}
