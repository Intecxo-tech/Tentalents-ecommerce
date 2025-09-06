'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import Exchange from '../exchange/Exchange';
import './yourorder.css';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: {
    title: string;
    imageUrls: string[];
    slug: string;
  };
}

interface OrderData {
  id: string;
  status: string;
  items: OrderItem[];
}

interface YourOrderProps {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  buyerId: string;
}

const YourOrder: React.FC<YourOrderProps> = ({ orders, loading, error, buyerId }) => {
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error loading orders: {error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  const allItems = orders.flatMap(order =>
    order.items.map(item => ({ ...item, orderStatus: order.status, orderId: order.id }))
  );

  // Fetch all return requests
  const fetchReturnRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(
        'https://order-service-faxh.onrender.com/api/orders/return-requests',
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

      <div className="review-button-container">
        <button className="bordered-button">
          Give Us a Review <Star />
        </button>

        {hasDeliveredOrder && (
          <div className="return-refund-button-container" style={{ marginTop: '10px' }}>
            {requestStatusMap[allItems[0].orderId] ? (
              <p className="bordered-button">{requestStatusMap[allItems[0].orderId]}</p>
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
        )}
      </div>

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
