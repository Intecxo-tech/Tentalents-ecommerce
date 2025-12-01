'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Dropdown from '../dropdown/Dropdownbutton';
import Balanceicon from '../../../assets/balance.png';
import BalanceSkeleton from './BalanceSkeleton';
import { jwtDecode } from 'jwt-decode';

const statusOptions = ['Full Balance', 'Past Week', 'Yesterday', 'Last Month'];  // 👈 Added "All"

interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  order?: {
    id: string;
    status: string;
    createdAt?: string;
    paymentStatus?: string;
  };
}

interface BalanceProps {
  vendorId?: string;
}

interface TokenPayload {
  role?: string;
  [key: string]: any;
}

const Balance: React.FC<BalanceProps> = ({ vendorId }) => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("Full Balance");   // 👈 Default is now ALL

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userRole: string | null = null;

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        userRole = decoded.role || null;
      } catch (e) {
        console.error('Failed to decode JWT in Balance component:', e);
      }
    }

    if (userRole === 'admin' && !vendorId) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        let fetchedOrders: VendorOrder[] = [];

        if (userRole === 'admin' && vendorId) {
          const res = await axios.get(
            'https://adminservice.zeabur.app/api/admin/sellers/all-with-products',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const vendors = res.data.data || [];
          const targetVendor = vendors.find((vendor: any) => String(vendor.id) === String(vendorId));

          if (!targetVendor) {
            setError('Vendor not found');
            setLoading(false);
            return;
          }

          const allOrders: VendorOrder[] = [];

          targetVendor.orderItems?.forEach((orderItem: any) => {
            const price = parseFloat(orderItem.totalPrice);
            if (orderItem.order && !isNaN(price)) {
              allOrders.push({
                id: orderItem.id,
                quantity: orderItem.quantity,
                totalPrice: orderItem.totalPrice,
                dispatchStatus: orderItem.dispatchStatus,
                order: {
                  id: orderItem.order.id,
                  status: orderItem.order.status,
                  createdAt: orderItem.order.placedAt,
                  paymentStatus: orderItem.order.paymentStatus,
                },
              });
            }
          });

          fetchedOrders = allOrders;
        } else {
          const res = await axios.get(
            'https://orderservice.zeabur.app/api/orders/vendor/orders',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          fetchedOrders = res.data.data || [];
        }

        setOrders(fetchedOrders);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load balance data');
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchOrders();
    else {
      setLoading(false);
      setError('No token found. Cannot fetch data.');
    }
  }, [vendorId]);

  if (loading) return <BalanceSkeleton />;
  if (error) return <div>{error}</div>;

  // --- COMPLETED ORDERS ---
  const completedOrders = orders.filter(
    (order) =>
      order.order?.paymentStatus?.toLowerCase() === 'success' &&
      order.order?.status?.toLowerCase() === 'delivered'
  );

  // --- FILTER LOGIC (updated with "All") ---
  const applyFilter = (orders: VendorOrder[]) => {
    const now = new Date();

    if (filter === "Full Balance") return orders;    // 👈 Show all orders by default

    return orders.filter(order => {
      const createdAt = order.order?.createdAt ? new Date(order.order.createdAt) : null;
      if (!createdAt) return false;

      if (filter === "Yesterday") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return (
          createdAt.getDate() === yesterday.getDate() &&
          createdAt.getMonth() === yesterday.getMonth() &&
          createdAt.getFullYear() === yesterday.getFullYear()
        );
      }

      if (filter === "Past Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return createdAt >= weekAgo && createdAt <= now;
      }

      if (filter === "Last Month") {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = lastMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();
        return (
          createdAt.getMonth() === lastMonth &&
          createdAt.getFullYear() === year
        );
      }

      return true;
    });
  };

  const filteredOrders = applyFilter(completedOrders);

  const totalBalance = filteredOrders.length > 0
    ? filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    : 0;

  const sortedCompletedOrders = filteredOrders.sort((a, b) => {
    const dateA = a.order?.createdAt ? new Date(a.order.createdAt).getTime() : 0;
    const dateB = b.order?.createdAt ? new Date(b.order.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const recentOrder = sortedCompletedOrders[0];
  const recentAmount = recentOrder ? parseFloat(recentOrder.totalPrice) : 0;

  return (
    <div>
      <div className="Balance p-[15px] rounded-[10px] flex flex-col gap-[10px] flex-1">
        <div className="balanceheading flex justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <Image src={Balanceicon} alt="balanceicon" />
            <h2 className="mainheading">Balance</h2>
          </div>
          <div className="dropdownbutton">
            <Dropdown
              options={statusOptions}
              defaultValue="Full Balance"  // 👈 Default now ALL
              onSelect={(value) => setFilter(value)}
            />
          </div>
        </div>

        <div className="balanceamount text-[32px] text-[var(--secondary)]">
          <h2>${totalBalance.toFixed(2)}</h2>
        </div>

        <div className="totalbalance bg-[#EBEBEB] flex justify-between items-center p-[10px] rounded-[10px]">
          <p className="text-[var(--grey)]">Recents</p>
          <p>+${recentAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Balance;
