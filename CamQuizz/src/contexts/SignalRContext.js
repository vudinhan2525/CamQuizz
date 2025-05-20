import React, { createContext, useContext, useState } from 'react';

const HubConnectionContext = createContext(null);

export const HubConnectionProvider = ({ children }) => {
  const [hubConnection, setHubConnection] = useState(null);
  return (
    <HubConnectionContext.Provider value={{ hubConnection, setHubConnection }}>
      {children}
    </HubConnectionContext.Provider>
  );
};

export const useHubConnection = () => useContext(HubConnectionContext);
