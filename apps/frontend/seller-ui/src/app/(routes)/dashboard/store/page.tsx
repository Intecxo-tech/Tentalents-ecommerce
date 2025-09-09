'use client';
import React, { useEffect, useState } from 'react';
import StoreLayout from '../../../../shared/components/layouts/StoreLayout';
import Product from '../product/page';
import { ChevronDown, Search, PlusIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  status: string;
}

const Page = () => {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const vendorId = localStorage.getItem('vendorId');
        const token = localStorage.getItem('token');

        if (!vendorId || !token) return;

        const response = await fetch(
          `https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/profile/${vendorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch vendor profile');

        const data = await response.json();
        setVendor(data.vendor);
      } catch (err) {
        console.error('Error fetching vendor:', err);
      }
    };

    fetchVendor();
  }, []);

const handleAddProductClick = () => {
  if (!vendor) {
    toast.error("Vendor not found. Please log in again.");
    return;
  }

  if (vendor.status?.toUpperCase() !== "APPROVED") {
    toast.error(`Your vendor account is not approved yet. (Status: ${vendor.status})`);
    return;
  }

  router.push("/dashboard/createproduct");
};

  return (
    <StoreLayout>
      <div className="header">
        <div className="header-left">
          <h2>Store Overview</h2>
        </div>
        <div className="rightsidebar">
          <div className="search-bar" style={{ position: 'relative' }}>
            <div className="search-categories">
              Categories
              <ChevronDown size={16} className="chevron" />
            </div>
            <input
              className="search-input"
              placeholder="Search Tentalents.in"
            />
            <div className="search-button">
              <Search className="search-icon" size={20} />
            </div>
          </div>

          {/* ✅ Only controlled by click handler now */}
          <button className="background-button"  onClick={handleAddProductClick}
  disabled={!vendor}>
            Add Product <PlusIcon />
          </button>
        </div>
      </div>
      <Product />
    </StoreLayout>
  );
};

export default Page;
