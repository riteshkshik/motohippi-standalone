import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface AppContextType {
  theme: 'dark';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Always dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <AppContext.Provider value={{ theme: 'dark' }}>{children}</AppContext.Provider>;
}
