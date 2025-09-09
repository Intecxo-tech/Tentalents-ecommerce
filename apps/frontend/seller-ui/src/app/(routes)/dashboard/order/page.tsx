'use client';

import React, { useEffect, useState } from 'react';
import '../../../../shared/components/productaccept/productaccept.css';
import Image from 'next/image';
import { Search } from 'lucide-react';
import axios from 'axios';
import './order.css';
import FullOrderPage from '../orderform/Orderform';

export interface Product {
  id: string;
  title: string;
  imageUrls?: string[];
  originalPrice?: string;
}

export interface ShippingAddress {
  city: string;
  street?: string;
  state?: string;
  zip?: string;
}

export interface Order {
  id: string;
  status: string;
  paymentStatus?: string;
  dispatchStatus?: string;
   placedAt?: string;  
  shippingAddress?: ShippingAddress;
  createdAt: string;
  paymentMethod?: string;
}

export interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  product?: Product;
  order?: Order;
  createdAt: string;
}

// interface ProductAcceptProps {
//   limit?: number;
// }

const Page = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredOrders, setFilteredOrders] = useState<VendorOrder[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const getStatusClass = (status: string = '') => {
    const lowerStatus = status.toLowerCase();
    if (['failed', 'not_started', 'cancelled', 'denied'].includes(lowerStatus)) return 'failed';
    if (['pending', 'unpaid'].includes(lowerStatus)) return 'unpaid';
    if (['preparing', 'shipped', 'confirmed', 'dispatched'].includes(lowerStatus)) return 'process';
    if (['paid', 'delivered', 'success'].includes(lowerStatus)) return 'paid';
    return '';
  };

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setLoading(false);
    return;
  }

  const fetchVendorOrders = async () => {
    try {
      const res = await axios.get('https://order-service-322f.onrender.com/api/orders/vendor/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched Orders:', res.data.data);  // Debug here
      setOrders(res.data.data);
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchVendorOrders();
}, []);


  useEffect(() => {
    let updated = [...orders];

    if (statusFilter !== 'all') {
      updated = updated.filter(
        (o) => o.order?.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      updated = updated.filter((o) => {
        const date = new Date(o.order?.createdAt ?? o.createdAt);
        switch (dateFilter) {
          case 'today':
            return date.toDateString() === now.toDateString();
          case 'last7':
            return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
          case 'thisMonth':
            return (
              date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    setFilteredOrders(updated);
  }, [orders, dateFilter, statusFilter]);

  // const limitedOrders = limit ? filteredOrders.slice(0, limit) : filteredOrders;

  // Handlers for buttons
  const handleConfirm = (id: string) => console.log('Confirmed product ID:', id);
  const handleDeny = (id: string) => console.log('Denied product ID:', id);
  const handleViewStatus = (id: string) => console.log('Viewing status for ID:', id);
  const handleTrackOrder = (id: string) => console.log('Tracking order for ID:', id);
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  if (loading) return <div className="ordersempty"><p>Loading...</p></div>;
if (filteredOrders.length === 0) return <div className="ordersempty"><p>No orders found.</p></div>;


  return (
    <div className="orderspage">
      <div className="ordersheading">
        <div className="leftsideorder">
          <h1>Orders</h1>
        </div>
        <div className="rightsideorder">
          <div className="search-container">
            <div className="searchbar">
              <input className="search-input" placeholder="Search Your Store" />
              <div className="background-button">
                <Search className="search-icon" size={20} />
              </div>
            </div>
          </div>

          <select
            className="filter-dropdown bordered-button"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
          <select
            className="filter-dropdown bordered-button"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="productsection">
     {filteredOrders.map((orderItem) => {
          const orderStatus = orderItem.order?.status?.toLowerCase() || 'pending';
          const dispatchStatus = orderItem.order?.dispatchStatus?.toLowerCase() || 'not_started';

          const isPending = orderStatus === 'pending';
          const isConfirmed = orderStatus === 'confirmed';
          const isPreparing = dispatchStatus === 'preparing';
          const isDispatched = orderStatus === 'shipped';
          const isFinished = ['delivered', 'cancelled', 'refunded', 'returned'].includes(orderStatus);

          return (
            <div key={orderItem.id} className="product-item">
              <div className="product-section">
                <Image
                  src={orderItem.product?.imageUrls?.[0] || '/placeholder.png'}
                  alt={orderItem.product?.title || 'Product'}
                  width={100}
                  height={100}
                />
                <h3 className="product-title">{orderItem.product?.title || 'No Title'}</h3>
              </div>
              <div className="produtdetails">
                <p className="orderprice">{orderItem.quantity}</p>
                <p className="orderprice">₹{orderItem.totalPrice}</p>
                <p>{orderItem.order?.shippingAddress?.city || 'N/A'}</p>
                <div className="status-tags">
                  <span className={getStatusClass(orderItem.order?.paymentStatus)}>
                    {orderItem.order?.paymentStatus || 'Pending'}
                  </span>
                  <span className={getStatusClass(dispatchStatus)}>{dispatchStatus}</span>
                </div>
              </div>
              <div className="productstatus">
                {isPending ? (
                  <div className="product-buttons">
                    <button className="center-borderedbutton" onClick={() => handleDeny(orderItem.id)}>
                      Deny
                    </button>
                    <button className="background-buttonver" onClick={() => handleConfirm(orderItem.id)}>
                      Confirm
                    </button>
                  </div>
                ) : isPreparing ? (
                  <div className="product-buttons">
                    <button className="center-borderedbutton" onClick={() => handleTrackOrder(orderItem.id)}>
                      Track Order
                    </button>
                  </div>
                ) : isConfirmed ? (
                  <div className="product-buttons">
                    <button className="center-borderedbutton" onClick={() => handleViewStatus(orderItem.id)}>
                      View Status
                    </button>
                  </div>
                ) : isDispatched ? (
                  <div className="product-buttons">
                    <button className="center-borderedbutton" onClick={() => handleViewOrder(orderItem.order?.id || '')}>
                      View Order
                    </button>
                  </div>
                ) : isFinished ? (
                  <div className="product-buttons">
                    <button className="center-borderedbutton" onClick={() => handleViewOrder(orderItem.order?.id || '')}>
                      View Order
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrderId && (
        <FullOrderPage
          selectedOrderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          selectedOrderGroup={orders.filter((o) => o.order?.id === selectedOrderId)}
        />
      )}
    </div>
  );
};

export default Page;
