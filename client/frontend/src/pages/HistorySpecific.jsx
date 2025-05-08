import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import Spinner from "../components/Spinner";
import { GlobalContext } from "../Context";

export default function HistorySpecific() {
  const { showSpinner, isLoading, setIsLoading } = useContext(GlobalContext);
  const { logId } = useParams();
  const [logData, setLogData] = useState(null);

  const handleFetchLogData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:1337/log/log-history-specific/${logId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Nope`);
      }
      const data = await response.json();

      setLogData(data);

      console.log("Data:", data);
      console.log("LogData:", logData);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchLogData();
  }, []);

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-[200px] flex flex-col gap-10 items-center">
      HistorySpecific
    </div>
  );
}
