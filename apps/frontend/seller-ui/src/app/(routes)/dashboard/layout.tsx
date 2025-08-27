'use client';
import React, { useState } from 'react';
import SideBarWrapper from '../../../shared/components/sidebar/sidebar';
import './page.css';
import HeaderBanner from '../../../shared/components/header/headerbanner';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}

 <SideBarWrapper
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />
  
     

      {/* Main Content */}
      <main className="layout-content">
      <HeaderBanner   onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        {children}
      </main>
    </div>
  );
};

export default Layout;
