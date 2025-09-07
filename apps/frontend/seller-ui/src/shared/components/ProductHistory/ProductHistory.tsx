'use client';

import React, { useEffect, useState } from 'react';
import fulfil from '../../../assets/blur_on.png';
import Image from 'next/image';
import Dropdown from '../dropdown/Dropdownbutton';
import { Bell } from 'lucide-react';
import axios from 'axios';

const statusOptions = ['10 Orders', '20 Orders', '30 Orders'];

const ProductHistory: React.FC = () => {
  const [fulfilledPercentage, setFulfilledPercentage] = useState<number>(0);
  const [recentMessage, setRecentMessage] = useState<string>('NA');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    async function fetchOrders() {
      try {
        const res = await axios.get('http://localhost:3002/api/orders/vendor/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const orders = res.data.data;

        const fulfilled = orders.filter(
          (order: any) => order.order?.status?.toLowerCase() === 'delivered'
        );

        const totalOrders = orders.length;
        const fulfilledCount = fulfilled.length;

        const percentage = totalOrders > 0 ? Math.round((fulfilledCount / totalOrders) * 100) : 0;
        setFulfilledPercentage(percentage);

        // If no fulfilled orders, show "NA" instead of recent count
        if (fulfilledCount > 0) {
          const recentCount = Math.min(10, fulfilledCount);
          setRecentMessage(`Recent ${recentCount} order${recentCount !== 1 ? 's' : ''} were fulfilled`);
        } else {
          setRecentMessage('No orders fulfilled recently');
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setRecentMessage('Failed to load order data.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <div>Loading fulfillment data...</div>;

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
            onSelect={(value) => {
              console.log('Selected status:', value);
              // Filtering logic can be implemented here if needed
            }}
          />
        </div>
      </div>

      <div className="orderpercentage">
        <h2 className="text-[32px] text-[var(--secondary)]">{fulfilledPercentage}%</h2>
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
