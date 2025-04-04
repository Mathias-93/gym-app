import React, { useContext } from "react";
import { GlobalContext } from "../Context";
import { useParams } from "react-router";

export default function SplitPage() {
  const { splitId } = useParams();
  const { userSplit, setUserSplit } = useContext(GlobalContext);

  const currentSplit = userSplit.find(
    (split) => split.split_id.toString() === splitId
  );

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[250px]">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
        {currentSplit?.name}
      </h1>
    </div>
  );
}
