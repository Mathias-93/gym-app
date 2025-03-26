import { createContext, useState } from "react";

export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userInformation, setUserInformation] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [userSplit, setUserSplit] = useState([]);
  const [customUserSplit, setCustomUserSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState(null);

  return (
    <GlobalContext.Provider
      value={{
        userInformation,
        setUserInformation,
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        setIsLoadingAuth,
        userSplit,
        setUserSplit,
        isLoading,
        setIsLoading,
        exercises,
        setExercises,
        customUserSplit,
        setCustomUserSplit,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
