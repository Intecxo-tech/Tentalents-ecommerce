'use client';

import React, { useState, useEffect } from 'react';
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import './page.css';
import { AdminTabProvider } from '../../../services/AdminTabContext';
import HeaderBanner from '../../../shared/components/header/headerbanner';
import Adminheader from '../../../shared/components/adminheader/Adminheader';
import { jwtDecode } from 'jwt-decode';
import Vendor from '../dashboard/vendors/Vendor';
import Customer from '../../../shared/components/customer/Customer';

interface TokenPayload {
  role?: string;
  [key: string]: any;
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState<'vendors' | 'customers'>('vendors');
  // 👇 Add this


  useEffect(() => {
    const getUserRoleFromToken = () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);

        if (!token) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        const decoded = jwtDecode<TokenPayload>(token);
        console.log('Decoded JWT:', decoded);
        setUserRole(decoded.role || null);
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    getUserRoleFromToken();
  }, []);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  console.log('Rendering layout, userRole:', userRole);

  return (
     <AdminTabProvider>

    <div className="layout-wrapper">
     <SideBarWrapper
  isMobileMenuOpen={isMobileMenuOpen}
  onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
  userRole={userRole} // ✅ Pass role here
/>

      <main className="layout-content">
        {userRole === 'admin' ? (
          <>
            {/* ✅ Pass the required props here */}
        <Adminheader  />
          </>
        ) : (
          <>
            <HeaderBanner onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </>
        )}


        {children}
      </main>
    </div>
        </AdminTabProvider>

  );
};

export default Layout;
