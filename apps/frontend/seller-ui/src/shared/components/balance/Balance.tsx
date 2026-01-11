'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Dropdown from '../dropdown/Dropdownbutton';
import Balanceicon from '../../../assets/balance.png';
import BalanceSkeleton from './BalanceSkeleton';
import { jwtDecode } from 'jwt-decode';

const statusOptions = ['Full Balance', 'Past Week', 'Yesterday', 'Last Month'];

interface VendorOrder {
  id: string;
  totalPrice: string;
  order?: {
    status?: string;
    paymentStatus?: string;
    createdAt?: string;
  }
}

interface BalanceProps {
  vendorId?: string;
  // 👇 OPTIONAL: If passed, we use these. If not, we fetch our own.
  orders?: VendorOrder[]; 
}

const Balance: React.FC<BalanceProps> = ({ vendorId, orders: externalOrders }) => {
  const [internalOrders, setInternalOrders] = useState<VendorOrder[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("Full Balance");

  // ✅ Check if we are using external data (from Parent) or internal fetch
  const isUsingExternal = externalOrders !== undefined;
  
  // ✅ Decide which data to render
  const ordersToDisplay = isUsingExternal ? externalOrders : internalOrders;
  // If using external, we assume loading is finished (or handled by parent). 
  // You can add an 'isLoading' prop if you want the skeleton to show while parent fetches.
  const isLoading = isUsingExternal ? false : internalLoading; 

  useEffect(() => {
    // 🛑 STOP: If parent gave us orders, DO NOT fetch again.
    if (isUsingExternal) {
        return; 
    }

    // ... (Your Existing Fetch Logic Here) ...
    const token = localStorage.getItem('token');
    let userRole: string | null = null;
    
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            userRole = decoded.role || null;
        } catch (e) { console.error(e); }
    }

    if (userRole === 'admin' && !vendorId) {
        setInternalLoading(false);
        return;
    }

    async function fetchOrders() {
      try {
        setInternalLoading(true);
        // ... (Keep your existing Axios logic exactly as it is) ...
        // BUT replace 'setOrders(fetchedOrders)' with 'setInternalOrders(fetchedOrders)'
        
        // Example short version:
        const res = await axios.get('https://orderservice.zeabur.app/api/orders/vendor/orders', {
             headers: { Authorization: `Bearer ${token}` } 
        });
        setInternalOrders(res.data.data || []);
        
      } catch (err) {
        setError('Failed to load balance');
      } finally {
        setInternalLoading(false);
      }
    }

    if(token) fetchOrders();
  }, [vendorId, isUsingExternal]); // Add isUsingExternal to dependency

  if (isLoading) return <BalanceSkeleton />;
  if (error) return <div>{error}</div>;

  // --- CALCULATION LOGIC (Uses 'ordersToDisplay') ---
  const completedOrders = ordersToDisplay.filter(
    (order) =>
      order.order?.paymentStatus?.toLowerCase() === 'success' &&
      order.order?.status?.toLowerCase() === 'delivered'
  );

  // ... (Rest of your filter and render logic stays exactly the same) ...
  // just make sure you use 'ordersToDisplay' instead of 'orders'
  
  const applyFilter = (list: VendorOrder[]) => {
      // ... same filter logic ...
      if (filter === "Full Balance") return list;
      // ... etc
      return list;
  };

  const filteredOrders = applyFilter(completedOrders);
  
  const totalBalance = filteredOrders.length > 0
    ? filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    : 0;
    
  // ... Sorting logic ...
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
           {/* ... Header UI ... */}
           <div className="flex gap-[10px] items-center">
            <Image src={Balanceicon} alt="balanceicon" />
            <h2 className="mainheading">Balance</h2>
          </div>
           <Dropdown
              options={statusOptions}
              defaultValue="Full Balance"
              onSelect={(value) => setFilter(value)}
            />
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
