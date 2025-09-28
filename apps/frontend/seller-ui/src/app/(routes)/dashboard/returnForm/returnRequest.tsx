'use client';

import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import OrderTracking from '../../dashboard/orderform/orderTrackign';
import { RiCustomerService2Line } from 'react-icons/ri';

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
  placedAt?: string;
  status: string;
  paymentStatus?: string;
  dispatchStatus?: string;
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

interface FullOrderPageProps {
  selectedOrderId: string | null;
  onClose: () => void;
  selectedOrder: VendorOrder | null;
}

const ReturnRequestDrawer = ({ selectedOrderId, onClose, selectedOrder }: FullOrderPageProps) => {
  if (!selectedOrderId) return null;

  if (!selectedOrder) {
    return (
      <div className="sidebar-overlay" onClick={onClose}>
        <div className="sidebar-drawer" onClick={e => e.stopPropagation()}>
          <div className="sidebar-content" style={{ padding: '20px' }}>
            <p>No order data found for this order ID.</p>
            <button onClick={onClose} className="bordered-button">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const order = selectedOrder.order;

  const subtotal = parseFloat(selectedOrder.totalPrice);
  const shipping = 50; // fixed or dynamic
  const total = subtotal + shipping;

  const trackingSteps = [
    { label: 'Product Dispatched', dateTime: '24th Aug 25 - 12:00am' },
    { label: 'Product Ready To Transit', dateTime: '15th Sep 25 - 3:30pm' },
    { label: 'Product In Transit', dateTime: '15th Sep 25 - 3:30pm' },
    { label: 'Product Ready To Deliver', dateTime: '16th Sep 25 - 3:30pm' },
    { label: 'Product Out For Deliver', dateTime: '18th Sep 25 - 3:30pm' },
    { label: 'Product Delivered', dateTime: '19th Sep 25 - 3:30pm' },
  ];

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-drawer" onClick={e => e.stopPropagation()}>
        <div className="sidebar-content" style={{ padding: '20px' }}>
          <div className="orderpage2">
            <div className="orderheadingpage">
              <h2>Order Details</h2>
              <button className="bordered-button" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="ordercomponent">
              <div className="ordercard">
                <div className="orderpage-headerleft">
                  <p className="ordervalue border-grey">
                    <span className="orderlabel pr-1">Order ID:</span> {order?.id}
                  </p>
                  <p className="ordervalue">
                    <span className="orderlabel pr-1">Order Placed:</span>{' '}
                    {order?.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="orderdetails">
                  <div className="shipto">
                    <p>
                      <strong className="orderlabel mt-2">Ship To:</strong>{' '}
                      <span className="ordervalue pr-2">
                        {order?.shippingAddress?.street || ''}, {order?.shippingAddress?.city},{' '}
                        {order?.shippingAddress?.state || ''} {order?.shippingAddress?.zip || ''}
                      </span>
                    </p>
                  </div>

                  <div className="payment-method">
                    <p className="orderlabel">Payment Method:</p>
                    <p>
                      <span className="ordervalue">{order?.paymentMethod || 'Prepaid - UPI'}</span>
                    </p>
                  </div>

                  <div className="paymentamount">
                    <p className="orderlabel">Payment Details</p>
                    <div className="total">
                      <p className="ordervalue">Items Subtotal</p>
                      <p className="ordervalue">₹{subtotal.toFixed(2)}</p>
                    </div>
                    <div className="total">
                      <p className="ordervalue">Shipping</p>
                      <p className="ordervalue">₹{shipping.toFixed(2)}</p>
                    </div>
                    <div className="total">
                      <p className="ordervalue">Grand Total</p>
                      <p className="ordervalue">₹{total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="yourorder">Your Order</h1>
              <div className="orderlistitem" style={{ cursor: 'default' }}>
                <div key={selectedOrder.id} className="image-wrapper2">
                  <div className="firstsection">
                    <Image
                      src={selectedOrder.product?.imageUrls?.[0] || '/placeholder.png'}
                      alt={selectedOrder.product?.title || 'Product'}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 8, marginRight: 16 }}
                    />
                    <div className="ordercontentleft">
                      <h3 className="product-title">{selectedOrder.product?.title || 'No Title'}</h3>
                    </div>
                  </div>

                  <div className="flexcontainer">
                    <div className="rating-stars staras">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="lucide-star" />
                      ))}
                    </div>
                    <div className="quantity price-section">
                      <p className="price-style">₹{selectedOrder.totalPrice}</p>
                    </div>
                    <div className="quantity-sec orderquantitypage">
                      <p>Qnty: {selectedOrder.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              <OrderTracking steps={trackingSteps} />

              <div className="laststep">
                
                <button className="bordered-button" onClick={() => alert('Contact support clicked')}>
                  Connect With TenTalents Team <RiCustomerService2Line />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestDrawer;
