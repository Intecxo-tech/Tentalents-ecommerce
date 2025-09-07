'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, ChartNoAxesCombined, Code } from 'lucide-react';
import axios from 'axios';

interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  order?: {
    id: string;
    status: string; // check for canceled here
    createdAt?: string;
  };
}

const Ordercancel: React.FC = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    async function fetchOrders() {
      try {
        const res = await axios.get('http://localhost:3002/api/orders/vendor/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <div>Loading canceled orders...</div>;
  if (error) return <div>{error}</div>;

  // Filter canceled orders (accepts both 'canceled' and 'cancelled')
  const canceledOrders = orders.filter(
    (order) =>
      order.order?.status.toLowerCase() === 'canceled' ||
      order.order?.status.toLowerCase() === 'cancelled'
  );

  const totalOrders = orders.length;
  const canceledCount = canceledOrders.length;

  // Explicitly handle zero orders case
  const canceledPercentage =
    totalOrders > 0 ? Math.round((canceledCount / totalOrders) * 100) : 0;

  return (
    <div className="productrcard flex flex-col gap-[10px] p-[15px] rounded-[10px] bg-[#ffffff]">
      <div className="noofproduct">
        <div className="productheading flex justify-flex-start items-center gap-[10px]">
          <Code className="text-[var(--grey)]" />
          <h2 className="mainheading">Order Cancellation</h2>
        </div>
        <div className="percentage">
          <h2 className="text-[32px] text-[var(--secondary)]">{canceledPercentage}%</h2>
        </div>
        <div className="flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#E2FFD9]">
          <ChartNoAxesCombined className="text-[var(--grey)]" />
          <h2>
            +{canceledCount} Product{canceledCount !== 1 ? 's' : ''}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Ordercancel;
