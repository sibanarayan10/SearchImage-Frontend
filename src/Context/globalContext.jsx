import React, { createContext, useState } from "react";
export const Context = createContext({
  msg: {},
  setMsg: () => {},
  userAuth: false,
  setUserAuth: () => {},
  searchedImgs: [],
  setSearchedImgs: () => {},
});

export const ContextProvider = ({ children }) => {
  const [msg, setMsg] = useState({});
  const [userAuth, setUserAuth] = useState(false);
  const [searchedImgs, setSearchedImgs] = useState([]);

  return (
    <Context.Provider
      value={{
        msg,
        setMsg,
        userAuth,
        setUserAuth,
        searchedImgs,
        setSearchedImgs,
      }}
    >
      {children}
    </Context.Provider>
  );
};
