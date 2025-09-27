'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
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

interface TokenPayload {
  role?: string;
  [key: string]: any;
}

const Balance: React.FC = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { vendorId } = useParams(); // ✅ From the admin vendor detail page

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userRole: string | null = null; // 👈 Initialize a new variable for the role

    // 1. Decode JWT to get the reliable role, just like the Layout component
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        userRole = decoded.role || null;
      } catch (e) {
        console.error('Failed to decode JWT in Balance component:', e);
        // If decoding fails, treat as generic user or non-logged-in
      }
    }
    
    // Check if we have the necessary data to proceed
    if (userRole === 'admin' && !vendorId) {
        console.log('Admin role detected, but vendorId is not yet available. Waiting...');
        setLoading(false); 
        return;
    }

    async function fetchOrders() {
      try {
        let fetchedOrders: VendorOrder[] = [];

        // 2. Use the userRole derived from the token
        if (userRole === 'admin' && vendorId) {
          console.log('--- Executing ADMIN API Call --- (Role from Token)');
          const res = await axios.get('https://admin-service-k0id.onrender.com/api/admin/sellers/all-with-products', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const vendors = res.data.data || [];
          // Ensure vendorId is treated as a string for comparison
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
          // This runs for all non-admin users or if vendorId is missing (but role is not admin)
          console.log('--- Executing VENDOR API Call --- (Role from Token or No Role)');
          const res = await axios.get('https://order-service-322f.onrender.com/api/orders/vendor/orders', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

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

    // Only call fetchOrders if we have a token
    if (token) {
        fetchOrders();
    } else {
        setLoading(false);
        setError('No token found. Cannot fetch data.');
    }
  }, [vendorId]); // The dependency array remains the same

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
      return dateB - dateA; // Sort descending (newest first)
  });

  const recentOrder = sortedCompletedOrders[0];
  const recentAmount = recentOrder ? parseFloat(recentOrder.totalPrice) : null;

  return (
    // ... (rest of the component JSX)
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