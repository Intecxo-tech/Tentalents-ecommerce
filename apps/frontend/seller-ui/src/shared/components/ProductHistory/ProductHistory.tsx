'use client';

import React, { useEffect, useState } from 'react';
import fulfil from '../../../assets/blur_on.png';
import Image from 'next/image';
import Dropdown from '../dropdown/Dropdownbutton';
import { Bell } from 'lucide-react';
import axios from 'axios';
import ProductHistorySkeleton from './ProductHistorySkeleton';

const statusOptions = ['10 Orders', '20 Orders', '30 Orders'];

interface ProductHistoryProps {
  vendorId?: string; // Optional, for admin
}

const ProductHistory: React.FC<ProductHistoryProps> = ({ vendorId }) => {
  const [orders, setOrders] = useState<any[]>([]); // 👈 Store all orders once
  const [fulfilledPercentage, setFulfilledPercentage] = useState<number>(0);
  const [recentMessage, setRecentMessage] = useState<string>('NA');
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('10 Orders'); 

  // -----------------------------------------------------------
  // FETCH ORDERS ONLY ONCE
  // -----------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    let userRole: string | null = null;

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        userRole = decoded.role || null;
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }

    async function fetchOrders() {
      try {
        let fetchedOrders: any[] = [];

        if (userRole === 'admin' && vendorId) {
          const adminRes = await axios.get(
            'https://adminservice.zeabur.app/api/admin/sellers/all-with-products',
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const vendors = adminRes.data.data || [];
          const targetVendor = vendors.find(
            (v: any) => String(v.id) === String(vendorId)
          );

          if (!targetVendor) throw new Error('Vendor not found');
          fetchedOrders = targetVendor.orderItems || [];

        } else {
          const res = await axios.get(
            'https://orderservice.zeabur.app/api/orders/vendor/orders',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchedOrders = res.data.data || [];
        }

        setOrders(fetchedOrders); // 👈 Save for future filtering

      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setRecentMessage('Failed to load order data.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [vendorId]);

  // -----------------------------------------------------------
  // APPLY FILTER LOCALLY (NO API CALL)
  // -----------------------------------------------------------
  useEffect(() => {
    if (orders.length === 0) return;

    const limit = parseInt(filter);
    const limitedOrders = orders.slice(0, limit); // 👈 FAST local filtering

    const fulfilled = limitedOrders.filter(
      (order: any) => order.order?.status?.toLowerCase() === 'delivered'
    );

    const totalOrders = limitedOrders.length;
    const fulfilledCount = fulfilled.length;

    const percentage =
      totalOrders > 0
        ? Math.round((fulfilledCount / totalOrders) * 100)
        : 0;

    setFulfilledPercentage(percentage);

    if (fulfilledCount > 0) {
      setRecentMessage(
        `Recent ${fulfilledCount} fulfilled order${fulfilledCount !== 1 ? 's' : ''}`
      );
    } else {
      setRecentMessage('No orders fulfilled in this range');
    }
  }, [filter, orders]); // 👈 Only local filtering. Instant.

  if (loading) return <ProductHistorySkeleton />;

  return (
    <div className="productHistory p-[15px] rounded-[10px] bg-white flex flex-col gap-[10px] flex-1">
      <div className="inventoryheading flex align-center justify-between gap-[10px]">
        <div className="flex justify-flex-start items-center gap-[10px]">
          <Image src={fulfil} alt="monitor" />
          <h2 className="mainheading">Fulfillment %</h2>
        </div>
        <div className="flex justify-flex-end">
          <Dropdown
            options={statusOptions}
            defaultValue="10 Orders"
            onSelect={(value) => setFilter(value)} 
          />
        </div>
      </div>

      <div className="orderpercentage">
        <h2 className="text-[32px] text-[var(--secondary)]">
          {fulfilledPercentage}%
        </h2>
      </div>

      <div className="flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#EBEBEB]">
        <p className="text-[var(--grey)]">
          <Bell />
        </p>
        <p>{recentMessage}</p>
      </div>
    </div>
  );
};

export default ProductHistory;
