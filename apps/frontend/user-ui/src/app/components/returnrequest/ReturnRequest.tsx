'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Star } from 'lucide-react';
import Exchange from '../exchange/Exchange';
import '../yourorder/yourorder.css';
import YourOrderSkeleton from '../yourorder/YourOrderSkeleton';
import { RiCustomerService2Line } from 'react-icons/ri';
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
  shippingAddress: ShippingAddress;
     resolvedAt?: string | null;  // Add missing prop
}

interface YourOrderProps {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  buyerId: string;
  // FIX 2 APPLIED HERE: Update the prop type to allow async function
  onCancelOrder: (order: OrderData) => void | Promise<void>; 
}

const ReturnRequest: React.FC<YourOrderProps> = ({ orders,onCancelOrder, loading, error, buyerId }) => {
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
        'https://order-service-322f.onrender.com/api/orders/return-requests',
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

  const returnRequestMap = returnRequests.reduce((acc, req) => {
  acc[req.orderId] = {
    status: req.status,
    resolvedAt: req.resolvedAt,  // ✅ capture resolvedAt here
  };
  return acc;
}, {} as Record<string, { status: string; resolvedAt: string | null }>);


  const hasDeliveredOrder = orders.some(order => order.status.toLowerCase() === 'delivered');

  return (
    <div className="products-lists productlistaddtocart2 ">
      
      <div className="product-list product-list2">
        <h2 className="yourorder2">Your Orders</h2>
        {allItems.map(item => (
          <Link key={item.id} href={`/shop/${item.product.slug || ''}`} passHref>
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
    {orders.map(order => {
const resolvedAtStr = returnRequestMap[order.id]?.resolvedAt || null;
const resolvedAtDate = resolvedAtStr ? new Date(resolvedAtStr) : null;

  const formattedResolvedAt = resolvedAtDate
    ? resolvedAtDate.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  const dispatchTime = order.dispatchTime;

  return (

   <div className="mainsection">
      <h2 className="yourorder2">Order Return Tracking</h2>
       <div key={order.id} className="orderupdates orderupdates2">
          
      <div className="ordervalueleft">
        <Package />
        <p className="orderlabel">Order Updates</p>
        {resolvedAtDate ? (
          <p className="ordervalue">
            Delivery Arriving on <strong>{formattedResolvedAt}</strong>
          </p>
        ) : dispatchTime ? (
          <p className="ordervalue">
            Delivery Arriving on {new Date(dispatchTime).toLocaleDateString()} at{' '}
            {new Date(dispatchTime).toLocaleTimeString()}
          </p>
        ) : (
          <p className="ordervalue">Dispatch details not available yet</p>
        )}
      </div>

      <div className="ordervalueright">
        <button className="background-button">
          Need Support <RiCustomerService2Line />
        </button>
      </div>
    </div>
    </div>
  );
})}







     
    </div>
   
  );
};

export default ReturnRequest;
