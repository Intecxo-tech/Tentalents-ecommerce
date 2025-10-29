'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import Exchange from '../exchange/Exchange';
import './yourorder.css';
import YourOrderSkeleton from './YourOrderSkeleton';
interface ShippingAddress {
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  addressLine2?: string;
  addressType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string; // Added missing prop
  productId: string; // Added missing prop
  listingId: string; // Added missing prop
  vendorId: string; // Added missing prop
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string; // Added missing prop
  addedAt: string; // Added missing prop
  dispatchStatus: string; // Added missing prop
  dispatchTime: string | null; // Added missing prop
  product: {
    title: string;
    imageUrls: string[];
    slug: string;
  };
}

interface OrderData {
  id: string;
  buyerId: string; // Add missing prop
  totalAmount: string; // Add missing prop
  paymentMode: string; // Add missing prop
  paymentStatus: string; // Add missing prop
  shippingAddressId: string; // Add missing prop
  placedAt: string; // Add missing prop
  updatedAt: string; // Add missing prop
  stripePaymentIntentId: string | null; // Add missing prop
  dispatchStatus: string;
  dispatchTime: string | null;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress; // Add missing prop
}

interface YourOrderProps {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  buyerId: string;
  // FIX 2 APPLIED HERE: Update the prop type to allow async function
  onCancelOrder: (order: OrderData) => void | Promise<void>; 
}

const YourOrder: React.FC<YourOrderProps> = ({ orders,onCancelOrder, loading, error, buyerId }) => {
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
const isOrderCancelable = (status: string, dispatchStatus: string) => {
  const lowerStatus = status.toLowerCase();
  const lowerDispatch = dispatchStatus.toLowerCase();
  return (
    lowerStatus !== 'canceled' &&
    lowerStatus !== 'delivered' &&
    lowerDispatch !== 'dispatched' &&
    lowerDispatch !== 'on transit'
  );
};

  if (loading) return <p><YourOrderSkeleton /></p>;
  if (error) return <p>Error loading orders: {error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;
const allItems = orders.flatMap(order =>
  order.items.map(item => ({
    ...item,
    orderStatus: order.status,
    orderId: order.id,
    dispatchStatus: order.dispatchStatus, // ✅ Add this line
  }))
);


  // Fetch all return requests
  const fetchReturnRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(
        'https://orderservice.zeabur.app/api/orders/return-requests',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch return requests');
      const data = await res.json();
      const requestsArray = Array.isArray(data)
        ? data
        : data.returnRequests || data.data || [];
      setReturnRequests(requestsArray);
    } catch (err) {
      console.error('Error fetching return requests:', err);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const requestStatusMap = returnRequests.reduce((acc, req) => {
    acc[req.orderId] = req.status;
    return acc;
  }, {} as Record<string, string>);

  const hasDeliveredOrder = orders.some(order => order.status.toLowerCase() === 'delivered');

  return (
    <div className="products-lists productlistaddtocart2">
      <h2 className="yourorder">Your Orders</h2>
      <div className="product-list">
        {allItems.map(item => (
           <Link href={`/shop/${item.product.slug}`} key={item.id}>
            <div className="orderlistitem" style={{ cursor: 'pointer' }}>
              <div className="orderimage">
                <div
                  className="image-wrapper2"
                  style={{ position: 'relative', width: '100px', height: '100px' }}
                >
                  <Image
                    src={item.product.imageUrls?.[0] || '/placeholder.png'}
                    alt={item.product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="ordercontentleft">
                  <h3 className="product-title">{item.product.title}</h3>
                </div>
              </div>

              <div className="flexcontainer">
                <div className="rating-stars staras">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="lucide-star" />
                  ))}
                </div>

                <div className="quantity price-section">
                  <p className="price-style">${parseFloat(item.unitPrice).toFixed(2)}</p>
                </div>

                <div className="quantity-sec orderquantitypage">
                  <p>Qnty: {item.quantity}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>



{/* New container for buttons that appear regardless of delivery status (like Cancel) */}
<div 
    className="cancel-order-standalone-container"
    style={{ marginTop: '10px', display: 'flex', gap: '10px' }}
>
    
    {isOrderCancelable(allItems[0].orderStatus, allItems[0].dispatchStatus) && (
        <button
            className="bordered-button return-refund-button"
            onClick={(e) => {
                e.preventDefault();
                const orderToCancel = orders.find(o => o.id === allItems[0].orderId);
                if (orderToCancel) {
                    onCancelOrder(orderToCancel);
                }
            }}
        >
            Cancel Order
        </button>
    )}
</div>


{/* This section remains wrapped in hasDeliveredOrder, as it relates to delivered items */}
{hasDeliveredOrder && (
    <div className="review-button-container">
        {/* ✅ Show Review button only when delivered */}
       

        <div
            className="return-refund-button-container"
            style={{ marginTop: '10px', display: 'flex', gap: '10px' }}
        >
            {/* ✅ Return / Refund Button or Status (Only relevant for delivered orders) */}
            {requestStatusMap[allItems[0].orderId] ? (
              <Link href="/returnrequest"> <p className="bordered-button">View {requestStatusMap[allItems[0].orderId]
    ?.toLowerCase()
    .replace(/^\w/, (c: string) => c.toUpperCase())} Status</p></Link> 
            ) : (
                <button
                    className="bordered-button return-refund-button"
                    onClick={() => {
                        setSelectedOrderId(allItems[0].orderId);
                        setShowExchangeModal(true);
                    }}
                >
                    Return / Refund
                </button>
            )}
        </div>
    </div>
)}



      {showExchangeModal && selectedOrderId && (
        <Exchange
          onClose={() => setShowExchangeModal(false)}
          orderId={selectedOrderId}
          buyerId={buyerId}
          onRequestSuccess={async (orderId, status) => {
            // Immediately fetch the latest requests from backend
            await fetchReturnRequests();
          }}
        />
      )}
    </div>
  );
};

export default YourOrder;

