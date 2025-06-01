import React, { createContext, useContext, useState } from 'react';

// Tạo context để lưu giữ kết nối SignalR
const HubConnectionContext = createContext(null);

export const HubConnectionProvider = ({ children }) => {
    const [hubConnection, setHubConnection] = useState(null);

    return (
        <HubConnectionContext.Provider value={{ hubConnection, setHubConnection }}>
            {children}
        </HubConnectionContext.Provider>
    );
};

export const useHubConnection = () => {
    const context = useContext(HubConnectionContext);
    if (!context) {
        throw new Error("useHubConnection must be used within a HubConnectionProvider");
    }
    return context;
};
