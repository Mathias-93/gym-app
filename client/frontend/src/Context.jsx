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

  return (
    <GlobalContext.Provider
      value={{
        userInformation,
        setUserInformation,
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        setIsLoadingAuth,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
