'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Dropdown from '../dropdown/Dropdownbutton';
import Balanceicon from '../../../assets/balance.png';
import BalanceSkeleton from './BalanceSkeleton';
import { jwtDecode } from 'jwt-decode'; // 👈 Import jwtDecode here

const statusOptions = ['Past Week', 'Yesterday', 'Last Month'];

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
  vendorId?: string; // optional, used only for admin view
}

interface TokenPayload {
  role?: string;
  [key: string]: any;
}

const Balance: React.FC<BalanceProps> = ({ vendorId }) => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    // Admin with vendorId check
    if (userRole === 'admin' && !vendorId) {
      console.log('Admin role detected, but vendorId is not yet available. Waiting...');
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        let fetchedOrders: VendorOrder[] = [];

        // --- Admin flow using vendorId ---
        if (userRole === 'admin' && vendorId) {
          console.log('--- Executing ADMIN API Call --- (Role from Token)');

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
          console.log('Admin Flow - Extracted Orders:', fetchedOrders);

        } else {
          // --- Vendor or non-admin flow ---
          console.log('--- Executing VENDOR API Call --- (Role from Token or No Role)');

          const res = await axios.get(
            'https://orderservice.zeabur.app/api/orders/vendor/orders',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          fetchedOrders = res.data.data || [];
          console.log('Vendor Flow - Fetched Orders:', fetchedOrders);
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

  const completedOrders = orders.filter(
    (order) =>
      order.order?.paymentStatus?.toLowerCase() === 'success' &&
      order.order?.status?.toLowerCase() === 'delivered'
  );

  const totalBalance = completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    : null;

  const sortedCompletedOrders = completedOrders.sort((a, b) => {
    const dateA = a.order?.createdAt ? new Date(a.order.createdAt).getTime() : 0;
    const dateB = b.order?.createdAt ? new Date(b.order.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const recentOrder = sortedCompletedOrders[0];
  const recentAmount = recentOrder ? parseFloat(recentOrder.totalPrice) : null;

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
              defaultValue="Past Week"
              onSelect={(value) => {
                console.log('Selected status:', value);
              }}
            />
          </div>
        </div>

        <div className="balanceamount text-[32px] text-[var(--secondary)]">
          <h2>{totalBalance !== null ? `$${totalBalance.toFixed(2)}` : 'N/A'}</h2>
        </div>

        <div className="totalbalance bg-[#EBEBEB] flex justify-between items-center p-[10px] rounded-[10px]">
          <p className="text-[var(--grey)]">Recents</p>
          <p>{recentAmount !== null ? `+$${recentAmount.toFixed(2)}` : '+$0.00'}</p>
        </div>
      </div>
    </div>
  );
};

export default Balance;

