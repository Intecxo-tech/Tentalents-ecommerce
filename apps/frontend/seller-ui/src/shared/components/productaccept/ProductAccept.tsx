'use client';

import React from 'react';
import './productaccept.css';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
// --- Interfaces for props ---

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

interface ProductAcceptProps {
  orders: VendorOrder[];
  limit?: number;
}

const ProductAccept = ({ orders, limit }: ProductAcceptProps) => {
  // Event handlers
  const handleConfirm = (id: string) => console.log('Confirmed product ID:', id);
  const handleDeny = (id: string) => console.log('Denied product ID:', id);
  const handleViewStatus = (id: string) => console.log('Viewing status for ID:', id);
  const handleTrackOrder = (id: string) => console.log('Tracking order for ID:', id);
  const handleViewOrder = (id: string) => console.log('Viewing order for ID:', id);

  const getStatusClass = (status: string = '') => {
    const lowerStatus = status.toLowerCase();
    if (['failed', 'not_started', 'cancelled', 'denied'].includes(lowerStatus)) return 'failed';
    if (['pending', 'unpaid'].includes(lowerStatus)) return 'unpaid';
    if (['preparing', 'shipped', 'confirmed', 'dispatched'].includes(lowerStatus)) return 'process';
     if (['paid', 'delivered', 'success'].includes(lowerStatus)) return 'paid';
    return '';
  };

  const limitedOrders = limit ? orders.slice(0, limit) : orders;
  if (limitedOrders.length === 0) return <div className='ordersempty'>
    <ShoppingCart className='ordericon' size={80} />
    <p>No Orders Yet</p></div>;

  return (
    <div className="productsection">
      {limitedOrders.map((orderItem) => {
         const orderStatus = orderItem.order?.status?.toLowerCase() || 'pending';
        const dispatchStatus = orderItem.order?.dispatchStatus?.toLowerCase() || 'not_started';

        // Rule 1: For "Confirm/Deny" buttons
        const isPending = orderStatus === 'pending';
        
        // Rule 2: For "View Status" button
        const isConfirmed = orderStatus === 'confirmed';
        
        // Rule 3: For "Track Order" button
        const isPreparing = dispatchStatus === 'preparing';
        
        // Rule 4: For "View Order" button (for dispatched)
        const isDispatched = orderStatus === 'shipped';

        // Rule 5: For other finished orders
        const isFinished = ['delivered', 'cancelled', 'refunded', 'returned'].includes(orderStatus);

        return (
          <div key={orderItem.id} className="product-item">
            <div className="product-section">
              <Image src={orderItem.product?.imageUrls?.[0] || '/placeholder.png'} alt={orderItem.product?.title || 'Product'} width={100} height={100} />
              <h3 className="product-title">{orderItem.product?.title || "No Title"}</h3>
            </div>
            <div className="produtdetails">
              <p className="orderprice">{orderItem.quantity}</p>
              <p className="orderprice">₹{orderItem.totalPrice}</p>
              <p>{orderItem.order?.shippingAddress?.city || "N/A"}</p>
              <div className="status-tags">
                <span className={getStatusClass(orderItem.order?.paymentStatus)}>{orderItem.order?.paymentStatus || 'Pending'}</span>
                <span className={getStatusClass(dispatchStatus)}>{dispatchStatus}</span>
              </div>
            </div>
            <div className="productstatus">
           {isPending ? (
                <div className="product-buttons">
                  <button className="center-borderedbutton" onClick={() => handleDeny(orderItem.id)}>Deny</button>
                  <button className="background-buttonver" onClick={() => handleConfirm(orderItem.id)}>Confirm</button>
                </div>
              ) : isPreparing ? ( // Check 'preparing' before 'confirmed'
                <div className="product-buttons">
                  <button className="center-borderedbutton" onClick={() => handleTrackOrder(orderItem.id)}>Track Order</button>
                </div>
              ) : isConfirmed ? (
                <div className="product-buttons">
                  <button className="center-borderedbutton" onClick={() => handleViewStatus(orderItem.id)}>View Status</button>
                </div>
              ) : isDispatched ? (
                <div className="product-buttons">
                  <button className="center-borderedbutton" onClick={() => handleViewOrder(orderItem.id)}>View Order</button>
                </div>
              ) : isFinished ? (
                <div className="product-buttons">
                  <button className="center-borderedbutton" onClick={() => handleViewOrder(orderItem.id)}>View Order</button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductAccept;