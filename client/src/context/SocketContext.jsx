import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const s = getSocket(token);
      setSocket(s);

      s.on('connect', () => {
        console.log('Socket connected:', s.id);
      });

      return () => {
        // Don't disconnect on cleanup — keep alive across route changes
      };
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketContext;
