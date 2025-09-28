'use client';

import React from 'react';
import Image from 'next/image';
import '../orderform/orderform.css';
import './orderforms.css';
import { Star } from 'lucide-react';
import OrderTracking from '../orderform/orderTrackign';
import { RiCustomerService2Line } from 'react-icons/ri';

interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  product?: {
    id: string;
    title: string;
    imageUrls?: string[];
  };
  order?: {
    id: string;
    status: string;
    paymentStatus?: string;
    dispatchStatus?: string;
    paymentMethod?: string;
    shippingAddress?: {
      city?: string;
      street?: string;
      state?: string;
      zip?: string;
      phone?: string;
    };
    placedAt?: string;
    buyer?: {
      name: string;
      profileImage?: string;
    };
  };
  vendor?: {
    id: string;
    name: string;
    profileImage?: string;
    businessName?: string;
  }[];
}

interface OrderformsProps {
  orderItem: VendorOrder | null;
  onClose: () => void;
}

const Orderforms = ({ orderItem, onClose }: OrderformsProps) => {
  if (!orderItem) return null;

  const product = orderItem.product;
  const order = orderItem.order;
  const shippingAddress = order?.shippingAddress;
  const quantity = orderItem.quantity;
  const totalPrice = parseFloat(orderItem.totalPrice);
  const shipping = 50;
  const total = totalPrice + shipping;

const uniqueVendors = Array.isArray(orderItem.vendor)
  ? orderItem.vendor
  : orderItem.vendor
  ? [orderItem.vendor]
  : [];


  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-content" style={{ padding: 20 }}>
          <div className="orderpage">
            <div className="orderheadingpage">
              <h2>Order Details</h2>
              <button className="bordered-button" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="ordercard">
              <div className="orderpage-headerleft">
                <p className="ordervalue border-grey">
                  <span className="orderlabel pr-1">Order ID:</span> {order?.id || orderItem.id}
                </p>
                <p className="ordervalue">
                  <span className="orderlabel pr-1">Order Placed:</span>{' '}
                  {order?.placedAt ? new Date(order.placedAt).toLocaleDateString() : '-'}
                </p>
                <p className="ordervalue">
                  <span className="orderlabel pr-1">Status:</span> {order?.status || orderItem.dispatchStatus}
                </p>
              </div>

              <div className="orderdetails">
                <div className="shipto">
                  <p>
                    <strong className="orderlabel mt-2">Ship To:</strong>{' '}
                    <span className="ordervalue pr-2">
                      {shippingAddress?.street || ''}, {shippingAddress?.city || ''},{' '}
                      {shippingAddress?.state || ''} {shippingAddress?.zip || ''}
                    </span>
                  </p>
                  <p>
                    <strong className="orderlabel mt-2">Phone:</strong>{' '}
                    <span className="ordervalue">{shippingAddress?.phone || '-'}</span>
                  </p>
                </div>

                <div className="payment-method">
                  <p className="orderlabel">Payment Method:</p>
                  <p>
                    <span className="ordervalue">{order?.paymentMethod || '-'}</span>
                  </p>
                </div>

                <div className="paymentamount">
                  <p className="orderlabel">Payment Details</p>
                  <div className="total">
                    <p className="ordervalue">Items Subtotal</p>
                    <p className="ordervalue">₹{totalPrice.toFixed(2)}</p>
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

            <div className="orderinfo">
              <div className="ordercards">
                <div className="buyer-info">
                  <h1 className="ordertitle">Order Facilitated To - Customer</h1>
                  <div className="buyercard">
                    <div className="buyercardleft">
                      <Image
                        src={order?.buyer?.profileImage || '/placeholder.png'}
                        alt={order?.buyer?.name || 'Buyer'}
                        width={50}
                        height={50}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="ordercardright">
                      <p>{order?.buyer?.name || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="vendorinfo">
                  <h1 className="ordertitle">Order Facilitated by - Vendor</h1>
                  <div className="buyercard">
                    {uniqueVendors.length === 0 && <p>No vendor information available.</p>}
                    {uniqueVendors.map((vendor) => (
                      <div key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Image
                          src={vendor.profileImage || '/placeholder.png'}
                          alt={vendor.name}
                          width={50}
                          height={50}
                          style={{ borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <p className="vendorname">{vendor.name}</p>
                          <p className="orderlabel">{vendor.businessName || '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h1 className="yourorder">Order Item</h1>
            <div className="orderlistitem" style={{ cursor: 'default' }}>
              <div className="image-wrapper2">
                <div className="firstsection">
                  <Image
                    src={product?.imageUrls?.[0] || '/placeholder.png'}
                    alt={product?.title || 'Product'}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 8, marginRight: 16 }}
                  />
                  <div className="ordercontentleft">
                    <h3 className="product-title">{product?.title || 'No Title'}</h3>
                  </div>
                </div>

                <div className="flexcontainer">
                  <div className="rating-stars staras">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="lucide-star" />
                    ))}
                  </div>
                  <div className="quantity price-section">
                    <p className="price-style">₹{totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="quantity-sec orderquantitypage">
                    <p>Qnty: {quantity}</p>
                  </div>
                </div>
              </div>
            </div>

            <OrderTracking
              steps={[
                { label: 'Order Placed', dateTime: order?.placedAt ? new Date(order.placedAt).toLocaleString() : '-' },
                { label: 'Dispatch Status', dateTime: orderItem.dispatchStatus },
              ]}
            />

            <div className="laststep">
              <button className="bordered-button" onClick={() => alert('Cancel order clicked')}>
                Cancel Order
              </button>
              <button className="bordered-button" onClick={() => alert('Connect vendor clicked')}>
                Connect with vendor <RiCustomerService2Line />
              </button>
              <button className="bordered-button" onClick={() => alert('Connect customer clicked')}>
                Connect with customer <RiCustomerService2Line />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderforms;
