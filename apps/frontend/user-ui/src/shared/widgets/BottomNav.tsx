// BottomNav.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Home, ShoppingCart, Package, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import './bottomnav.css';

const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>

      <Link href="/cart" className={`bottom-nav-item ${isActive('/cart') ? 'active' : ''}`}>
        <ShoppingCart size={24} />
        <span>Cart</span>
      </Link>

      <Link href="/orders" className={`bottom-nav-item ${isActive('/orders') ? 'active' : ''}`}>
        <Package size={24} />
        <span>Orders</span>
      </Link>

      <Link href="/myaccount" className={`bottom-nav-item ${isActive('/account') ? 'active' : ''}`}>
        <User size={24} />
        <span>Account</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
