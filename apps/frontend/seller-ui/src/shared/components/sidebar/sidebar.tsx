'use client';
import React, { useEffect, useState } from 'react';
import useSidebar from '../../../hooks/useSidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './sidebar.css';
import { BoxIcon, Home, CircleUser, X } from 'lucide-react';
import { RiCustomerService2Line } from 'react-icons/ri';
import Image from 'next/image';
import Seller from '../../../assets/seller.png';
import { jwtDecode } from 'jwt-decode';

interface SideBarWrapperProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
    userRole: string | null; 
}
type Vendor = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
};
const SideBarWrapper = ({ isMobileMenuOpen, onCloseMobileMenu, userRole }: SideBarWrapperProps) => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const [vendor, setVendor] = useState<Vendor | null>(null);
const [error, setError] = useState<string | null>(null);
  const pathName = usePathname();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#BCB3FF' : '#222222';

  useEffect(() => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return;

  try {
    const decoded: any = jwtDecode(token);
    const vendorId = decoded.vendorId;

    if (!vendorId) throw new Error('Invalid token: missing vendorId');

    const fetchVendor = async () => {
      try {
        const res = await fetch(`https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/profile/${vendorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch vendor');
        }

        const data = await res.json();
        setVendor(data.vendor);
      } catch (err: any) {
        console.error('❌ Error fetching vendor for sidebar:', err.message);
        setError(err.message);
      }
    };

    fetchVendor();
  } catch (err) {
    console.error('Token decode error:', err);
  }
}, []);

  const SidebarContent = () => (
  <>
    <div className="sidebar-header">
      <Link href="/">
        <span className="logo">Tentalents</span>
      </Link>
      <button className="close-button" onClick={onCloseMobileMenu}>
        <X size={24} />
      </button>
    </div>

    <div className="main">
      {userRole === 'admin' ? (
        <>
          <Link href="/dashboard">
            <div className="itemsec">
              <Home color={getIconColor('/admin/dashboard')} />
              Home
            </div>
          </Link>
          <Link href="/dashboard/orders">
            <div className="itemsec">
              <BoxIcon color={getIconColor('/admin/orders')} />
              Orders
            </div>
          </Link>
          <Link href="/dashboard/approve">
            <div className="itemsec">
              <BoxIcon color={getIconColor('/admin/approvals')} />
              Approvals
            </div>
          </Link>
          <Link href="/dashboard/myaccount">
            <div className="itemsec">
              <CircleUser color={getIconColor('/admin/myaccount')} />
              My Account
            </div>
          </Link>
        </>
      ) : (
        <>
          <Link href="/dashboard">
            <div className="itemsec">
              <Home color={getIconColor('/dashboard')} />
              Home
            </div>
          </Link>
          <Link href="/dashboard/store">
            <div className="itemsec">
              <BoxIcon color={getIconColor('/dashboard/store')} />
              Store
            </div>
          </Link>
          <Link href="/dashboard/myaccount">
            <div className="itemsec">
              <CircleUser color={getIconColor('/dashboard/myaccount')} />
              My Account
            </div>
          </Link>
          <Link href="/dashboard/support">
            <div className="itemsec">
              <RiCustomerService2Line color={getIconColor('/dashboard/support')} />
              Support
            </div>
          </Link>
        </>
      )}
    </div>

    {userRole === 'vendor' && vendor && (
      <div className="sellerinfo">
        <div className="sellerimage">
          <Image
            src={vendor.profileImage || Seller}
            alt="Seller Profile"
            width={40}
            height={40}
          />
        </div>
        <div className="seller-info">
          <h1 className="sellerheading">{vendor.name}</h1>
          <p className="selleremail">{vendor.email}</p>
        </div>
      </div>
    )}
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
