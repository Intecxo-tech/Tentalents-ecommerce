'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Dropdown from '../dropdown/Dropdownbutton';
import Balanceicon from '../../../assets/balance.png';
import axios from 'axios';
import BalanceSkeleton from './BalanceSkeleton'; // ✅ Import the skeleton

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

const statusOptions = ['Past Week', 'Yesterday', 'Last Month'];

const Balance: React.FC = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    async function fetchOrders() {
      try {
        const res = await axios.get('https://order-service-322f.onrender.com/api/orders/vendor/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load balance data');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <BalanceSkeleton />; // ✅ Show skeleton while loading
  if (error) return <div>{error}</div>;

  const completedOrders = orders.filter(
    (order) =>
      order.order?.paymentStatus?.toLowerCase() === 'success' &&
      order.order?.status?.toLowerCase() === 'delivered'
  );

  const totalBalance = completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    : null;

  const recentOrder = completedOrders[0];
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
