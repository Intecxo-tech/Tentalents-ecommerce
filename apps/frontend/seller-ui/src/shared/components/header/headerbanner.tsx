'use client';

import React, { useState } from 'react';
import { Search, Upload, Bell, House, Menu, Link } from 'lucide-react';
import { RiCustomerService2Line } from 'react-icons/ri';
import SideBarWrapper from '../sidebar/sidebar'; // adjust path
import './headerbanner.css';
import '../sidebar/sidebar.css'

interface HeaderBannerProps {
  onToggleSidebar?: () => void;
}

const HeaderBanner: React.FC<HeaderBannerProps> = ({ onToggleSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setIsMobileMenuOpen(prev => !prev);
  const closeSidebar = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Conditionally render Sidebar */}
      {/* {showSidebar && (
        <SideBarWrapper
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={closeSidebar}
        />
      )} */}

      <div className="headerbanner">
        <div className="search-container">
          <div className="searchbar">
            <input className="search-input" placeholder="Search Your Store" />
            <div className="background-button">
              <Search className="search-icon" size={20} />
            </div>
          </div>
        </div>

        <div className="rightside">
          {/* Hamburger (only visible in mobile via CSS) */}
         {onToggleSidebar && (
  <button className="hamburger-icon" onClick={onToggleSidebar}>
    <Menu />
  </button>
)}

          <button className="background-button">
            Bulk Upload <Upload />
          </button>
          <button className="bordered-button">
            <Bell />
          </button>
          <button className="bordered-button">
            <RiCustomerService2Line className="supportbutton" />
          </button>
          <button className="bordered-button account">
            Account <House />
          </button>
        </div>
      </div>
    </>
  );
};

export default HeaderBanner;
