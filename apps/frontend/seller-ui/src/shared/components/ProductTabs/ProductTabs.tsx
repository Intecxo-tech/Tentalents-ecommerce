'use client';

import React, { useEffect, useState } from 'react';
import './ProductTabs.css';
import ProductAccept from '../productaccept/ProductAccept';
import { FaBox } from "react-icons/fa";

// --- Interfaces & API Logic ---

const API_URL = "https://order-service-322f.onrender.com/api/orders/vendor/orders";

interface Product {
  id: string;
  title: string;
  imageUrls?: string[];
}
interface ShippingAddress {
  city: string;
}
interface Order {
  id: string;
  status: string;
  paymentStatus?: string;
  dispatchStatus?: string;
  shippingAddress?: ShippingAddress;
}
interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  product?: Product;
  order?: Order;
}

async function fetchVendorOrders(token: string): Promise<VendorOrder[]> {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch orders');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'API returned an error');
  }
  return data.data as VendorOrder[];
}

// --- Component Logic ---

const tabs = ['All', 'New', 'In Process', 'Completed'] as const;
type TabType = typeof tabs[number];

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [allOrders, setAllOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }
      try {
        const fetchedOrders = await fetchVendorOrders(token);
        setAllOrders(fetchedOrders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filterOrders = (tab: TabType) => {
    switch (tab) {
      case 'New':
        return allOrders.filter(item => item.order?.status?.toLowerCase() === 'pending');
      case 'In Process':
        return allOrders.filter(item => {
          const orderStatus = item.order?.status?.toLowerCase();
          const dispatchStatus = item.order?.dispatchStatus?.toLowerCase();
          return orderStatus === 'confirmed' || dispatchStatus === 'preparing' || dispatchStatus === 'dispatched' || orderStatus === 'shipped';
        });
      case 'Completed':
        return allOrders.filter(item =>
          ['delivered', 'cancelled', 'refunded', 'returned'].includes(item.order?.status?.toLowerCase() || '')
        );
      default:
        return allOrders;
    }
  };

  const filteredOrders = filterOrders(activeTab);

  if (loading) return <div>Loading all orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className='product-tabs-header'>
        <div className='product-tabs-title'>
          <FaBox className='titleicon' />
          <h2 className='mainheading'>Orders</h2>
        </div>
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <ProductAccept orders={filteredOrders} />
    </div>
  );
};

export default ProductTabs;