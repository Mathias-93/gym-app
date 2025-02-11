import { createContext, useState } from "react";

export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [userInformation, setUserInformation] = useState({
    email: "",
    password: "",
  });

  return (
    <GlobalContext.Provider value={{ userInformation, setUserInformation }}>
      {children}
    </GlobalContext.Provider>
  );
}
