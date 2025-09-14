'use client';
import React, { createContext, useContext, useState } from 'react';

type Tab = 'vendors' | 'customers';

interface AdminTabContextType {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
}

const AdminTabContext = createContext<AdminTabContextType | undefined>(undefined);

export const AdminTabProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<Tab>('vendors');

  return (
    <AdminTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </AdminTabContext.Provider>
  );
};

export const useAdminTab = () => {
  const context = useContext(AdminTabContext);
  if (!context) {
    throw new Error('useAdminTab must be used within an AdminTabProvider');
  }
  return context;
};
