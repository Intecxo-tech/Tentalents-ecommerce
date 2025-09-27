'use client';

import React, { useState } from 'react';
import './productaccept.css';
import Image from 'next/image';
import ProductAcceptSkeleton from './ProductAcceptSkeleton'; 
import { ShoppingCart } from 'lucide-react';
import FullOrderPage from '../../../app/(routes)/dashboard/orderform/Orderform';

interface Product {
  id: string;
  title: string;
  imageUrls?: string[];
}

interface ShippingAddress {
  city: string;
}

interface Order {
   placedAt?: string;
  id: string;
  status: string;
  paymentStatus?: string;
  dispatchStatus?: string;
  createdAt: string;
  paymentMethod?: string;
  shippingAddress?: ShippingAddress;
}

interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  product?: Product;
  order?: Order;
  createdAt: string;
}

interface ProductAcceptProps {
  orders?: VendorOrder[];
  limit?: number;
}

const ProductAccept = ({ orders, limit }: ProductAcceptProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (!orders) {
    return <ProductAcceptSkeleton count={limit || 5} />;
  }

  const handleConfirm = (id: string) => console.log('Confirmed product ID:', id);
  const handleDeny = (id: string) => console.log('Denied product ID:', id);
  const handleViewStatus = (id: string) => console.log('Viewing status for ID:', id);

  const handleTrackOrder = (id: string) => setSelectedOrderId(id);
  const handleViewOrder = (id: string) => setSelectedOrderId(id);

  const getStatusClass = (status: string = '') => {
    const lowerStatus = status.toLowerCase();
    if (['failed', 'not_started', 'cancelled', 'denied'].includes(lowerStatus)) return 'failed';
    if (['pending', 'unpaid'].includes(lowerStatus)) return 'unpaid';
    if (['preparing', 'shipped', 'confirmed', 'dispatched'].includes(lowerStatus)) return 'process';
    if (['paid', 'delivered', 'success'].includes(lowerStatus)) return 'paid';
    return '';
  };

  const limitedOrders = limit ? orders.slice(0, limit) : orders;

  if (limitedOrders.length === 0) {
    return (
      <div className='ordersempty'>
        <ShoppingCart className='ordericon' size={80} />
        <p>No Orders Yet</p>
      </div>
    );
  }const selectedVendorOrder = orders.find(o => o.id === selectedOrderId) || null;

  return (
    <>
      <div className="productsection">
        {limitedOrders.map((orderItem) => {
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
  ) : isPreparing ? (
    <div className="product-buttons">
      {/* Use orderItem.id instead of orderItem.order?.id */}
      <button className="center-borderedbutton" onClick={() => handleTrackOrder(orderItem.id)}>Track Order</button>
    </div>
  ) : isConfirmed ? (
    <div className="product-buttons">
      <button className="center-borderedbutton" onClick={() => handleViewStatus(orderItem.id)}>View Status</button>
    </div>
  ) : isDispatched ? (
    <div className="product-buttons">
      {/* Use orderItem.id instead of orderItem.order?.id */}
      <button className="center-borderedbutton" onClick={() => handleTrackOrder(orderItem.id)}>View Order</button>
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

      {/* Render FullOrderPage form when selectedOrderId is set */}
      {selectedOrderId && (
        <FullOrderPage
  selectedOrderId={selectedOrderId}
  onClose={() => setSelectedOrderId(null)}
  selectedOrder={selectedVendorOrder}
/>
      )}
    </>
  );
};

export default ProductAccept;
