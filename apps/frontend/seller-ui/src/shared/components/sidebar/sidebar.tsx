'use client';

import React, { useEffect } from 'react';
import useSidebar from '../../../hooks/useSidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './sidebar.css';
import { BoxIcon, Home, CircleUser, X } from 'lucide-react';
import { RiCustomerService2Line } from 'react-icons/ri';
import Image from 'next/image';
import Seller from '../../../assets/seller.png';

interface SideBarWrapperProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

const SideBarWrapper = ({ isMobileMenuOpen, onCloseMobileMenu }: SideBarWrapperProps) => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#BCB3FF' : '#222222';

  const SidebarContent = () => (
    <>
      {/* LOGO + Close Button (visible on mobile) */}
      <div className="sidebar-header">
        <Link href="/">
          <span className="logo">Tentalents</span>
        </Link>
        <button className="close-button" onClick={onCloseMobileMenu}>
          <X size={24} />
        </button>
      </div>

      <div className="main">
        <Link href="/dashboard">
        <div className="itemsec">
          <Home color={getIconColor('/')} />
          Home
        </div>
        </Link>
        <Link href="/dashboard/store">
        <div className="itemsec">
          <BoxIcon color={getIconColor('/store')} />
          Store
        </div>
        </Link>
        <Link href='/dashboard/myaccount'>
        <div className="itemsec">
          <CircleUser color={getIconColor('/account')} />
          Account
        </div>
        </Link>
        <Link href="/dashboard/support">
        <div className="itemsec">
          <RiCustomerService2Line className="customer-support" color={getIconColor('/support')} />
          Support
        </div>
        </Link>
      </div>

      <div className="sellerinfo">
        <div className="sellerimage">
          <Image src={Seller} alt="sellerimage" width={40} height={40} />
        </div>
        <div className="seller-info">
          <h1 className="sellerheading">Ramesh Singh</h1>
          <p className="selleremail">ramesh@gmail.com</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="sidebar-wrapper">
        <SidebarContent />
      </div>
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <SidebarContent />
      </div>
    </>
  );
};

export default SideBarWrapper;
