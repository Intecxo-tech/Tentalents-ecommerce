'use client';

import React, { useState } from 'react';
import './productaccept.css';
import Image from 'next/image';
import ProductAcceptSkeleton from './ProductAcceptSkeleton'; 
import { ShoppingCart,X } from 'lucide-react';
import FullOrderPage from '../../../app/(routes)/dashboard/orderform/Orderform';
import ReturnRequestDrawer from '../../../app/(routes)/dashboard/returnForm/returnRequest';

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
   returnRequest?: boolean;
  refundRequest?: boolean;
  returnRequestId?: string; // add this
  refundRequestId?: string;
  returnRequestStatus?: string; // REQUESTED / APPROVED / REJECTED
  refundRequestStatus?: string; // REQUESTED / APPROVED / REJECTED
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
  handleReturnRefundAction?: (requestId: string, type: 'return' | 'refund', action: 'approved' | 'rejected') => void;
  
}

const ProductAccept = ({ orders, limit ,handleReturnRefundAction}: ProductAcceptProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (!orders) {
    return <ProductAcceptSkeleton count={limit || 5} />;
  }
const [selectedReturnOrderId, setSelectedReturnOrderId] = useState<string | null>(null);

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
const selectedReturnVendorOrder = orders.find(o => o.id === selectedReturnOrderId) || null;

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
  {(orderItem.order?.returnRequestStatus?.toUpperCase() === 'REQUESTED' || 
  orderItem.order?.refundRequestStatus?.toUpperCase() === 'REQUESTED') ? (
    // Show Approve / Reject buttons only if status is REQUESTED
    <div className="product-buttons">
    <button
      className="center-borderedbutton"
      onClick={() =>
        handleReturnRefundAction &&
        handleReturnRefundAction(
          orderItem.order?.returnRequestStatus === 'REQUESTED'
            ? orderItem.order?.returnRequestId!
            : orderItem.order?.refundRequestId!,
          orderItem.order?.returnRequestStatus === 'REQUESTED' ? 'return' : 'refund',
          'rejected'
        )
      }
    >
      <X size={16} />
    </button>
    <button
      className="background-buttonver"
      onClick={() =>
        handleReturnRefundAction &&
        handleReturnRefundAction(
          orderItem.order?.returnRequestStatus === 'REQUESTED'
            ? orderItem.order?.returnRequestId!
            : orderItem.order?.refundRequestId!,
          orderItem.order?.returnRequestStatus === 'REQUESTED' ? 'return' : 'refund',
          'approved'
        )
      }
    >
      Approve
    </button>
  </div>
  ) : orderItem.order?.returnRequestStatus === 'APPROVED' ? (
  <button
    className="bordered-button"
    onClick={() => setSelectedReturnOrderId(orderItem.id)}
  >
    View Return Status
  </button>
) : orderItem.order?.refundRequestStatus === 'APPROVED' ? (
  <button
    className="bordered-button"
    onClick={() => setSelectedReturnOrderId(orderItem.id)}
  >
    View Refund Status
  </button>

  ) : orderItem.order?.returnRequestStatus === 'REJECTED' || orderItem.order?.refundRequestStatus === 'REJECTED' ? (
    <span className="bordered-button">Rejected</span>
  ) : (
    // Original ProductAccept buttons (Pending / Preparing / Confirmed / Shipped / Finished)
    <div className="product-buttons">
  {/* Pending orders */}
  {isPending ? (
    <>
      <button className="center-borderedbutton" onClick={() => handleDeny(orderItem.id)}>Deny</button>
      <button className="background-buttonver" onClick={() => handleConfirm(orderItem.id)}>Confirm</button>
    </>
  ) : 
  // Preparing orders
  isPreparing ? (
    <button className="center-borderedbutton" onClick={() => handleTrackOrder(orderItem.id)}>Track Order</button>
  ) : 
  // Confirmed orders
  isConfirmed ? (
    <button className="center-borderedbutton" onClick={() => handleViewStatus(orderItem.id)}>View Status</button>
  ) : 
  // Dispatched orders
  isDispatched ? (
    <button className="center-borderedbutton" onClick={() => handleViewOrder(orderItem.id)}>View Order</button>
  ) : 
  // Finished / Delivered / Cancelled orders
  isFinished ? (
    <>
      {/* Check return/refund status */}
      {orderItem.order?.returnRequestStatus === 'APPROVED' || orderItem.order?.refundRequestStatus === 'APPROVED' ? (
        <span className="bordered-button">Fulfilled / Returned</span>
      ) : orderItem.order?.returnRequestStatus === 'REJECTED' || orderItem.order?.refundRequestStatus === 'REJECTED' ? (
        <span className="bordered-button">Fulfilled / Rejected</span>
      ) : (
        <span className="bordered-button">Fulfilled / Delivered</span>
      )}
    </>
  ) : null}
</div>


  )}
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
      {selectedReturnOrderId && (
  <ReturnRequestDrawer
    selectedOrderId={selectedReturnOrderId}
    onClose={() => setSelectedReturnOrderId(null)}
    selectedOrder={selectedReturnVendorOrder}
  />
)}

    </>
  );
};

export default ProductAccept;
