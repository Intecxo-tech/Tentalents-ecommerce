'use client';

import { useAuth } from '../auth/callback/AuthContext'; // adjust path as needed
import LoginRegisterSidebar from '../components/loginregister/LoginRegisterSidebar';

export default function AuthUIWrapper() {
  const { isSidebarOpen, closeSidebar, login } = useAuth();

  return (
    <LoginRegisterSidebar
      isOpen={isSidebarOpen}
      onClose={closeSidebar}
      onLoginSuccess={(userData) => {
        login(userData);
        closeSidebar();
      }}
    />
  );
}
