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
  const [userSplit, setUserSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
