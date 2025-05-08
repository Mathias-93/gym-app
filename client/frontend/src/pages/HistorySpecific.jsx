import React from "react";
import { useParams } from "react-router";

export default function HistorySpecific() {
  const { logId } = useParams();

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
      HistorySpecific
    </div>
  );
}
