'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
// import '../orderform/orderform.css';
import '../orderform/orderform.css'
import { Star } from 'lucide-react';
import OrderTracking from '../orderform/orderTrackign';
import { RiCustomerService2Line } from 'react-icons/ri';
import OrderFormSkeleton from '../orderform/FullOrderPageSkeleton';

interface Product {
  id: string;
  title: string;
  imageUrls?: string[];
}

interface Vendor {
  id: string;
  name: string;
  profileImage?: string;
  businessName?: string;
}

interface Buyer {
  id: string;
  name: string;
  email: string;
  profileImage?: string; // assume if you want to add
}

interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: Product;
  vendor: Vendor;
  status: string;
  dispatchStatus: string;
}

interface FullOrder {
  id: string;
  buyer: Buyer;
  totalAmount: string;
  status: string;
  paymentMode: string;
  paymentStatus: string;
  placedAt: string;
  dispatchStatus: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

interface FullOrderPageAdminProps {
  selectedOrderId: string | null;
  onClose: () => void;
   selectedItemId: string | null; 
  
}

const ReturnReplace = ({ selectedOrderId, onClose,selectedItemId  }: FullOrderPageAdminProps) => {
  const [order, setOrder] = useState<FullOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!selectedOrderId) return;
  setLoading(true);
  axios
    .get(`https://order-service-322f.onrender.com/api/orders/order?id=${selectedOrderId}`)
    .then((res) => {
      if (res.data.success && res.data.orders?.length > 0) {
        setOrder(res.data.orders[0]);
      } else {
        setError('Order not found');
      }
    })
    .catch(() => setError('Failed to fetch order details'))
    .finally(() => setLoading(false));
}, [selectedOrderId]);

  const calculateTotals = () => {
    if (!order) return { subtotal: 0, shipping: 50, total: 50 };

    const subtotal = order.items.reduce((acc, item) => acc + parseFloat(item.totalPrice), 0);
    const shipping = 50; // You can get it dynamically if needed
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  };
const uniqueVendors = order
  ? Array.from(
      new Map(
        (selectedItemId
          ? order.items.filter(
              item => item.id === selectedItemId || item.product.id === selectedItemId
            )
          : order.items
        ).map(item => [item.vendor.id, item.vendor])
      ).values()
    )
  : [];

  if (!selectedOrderId) return null;

  if (loading)
   if (loading) return <OrderFormSkeleton />;

  if (error)
    return (
      <div className="sidebar-overlay" onClick={onClose}>
        <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-content" style={{ padding: 20 }}>
            <p>{error}</p>
            <button onClick={onClose} className="bordered-button">
              Close
            </button>
          </div>
        </div>
      </div>
    );

  if (!order)
    return null;

  const totals = calculateTotals();
// just before rendering
const filteredItems = selectedItemId
  ? order.items.filter(item => item.id === selectedItemId || item.product.id === selectedItemId)
  : order.items;

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
                  <span className="orderlabel pr-1">Order ID:</span> {order.id}
                </p>
                <p className="ordervalue">
                  <span className="orderlabel pr-1">Order Placed:</span>{' '}
                  {new Date(order.placedAt).toLocaleDateString()}
                </p>
                <p className="ordervalue">
                  <span className="orderlabel pr-1">Status:</span> {order.status}
                </p>
              </div>

              <div className="orderdetails">
                <div className="shipto">
                  <p>
                    <strong className="orderlabel mt-2">Ship To:</strong>{' '}
                    <span className="ordervalue pr-2">
                      {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 || ''},{' '}
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}
                    </span>
                  </p>
                  <p>
                    <strong className="orderlabel mt-2">Phone:</strong>{' '}
                    <span className="ordervalue">{order.shippingAddress.phone || '-'}</span>
                  </p>
                </div>

                <div className="payment-method">
                  <p className="orderlabel">Payment Method:</p>
                  <p>
                    <span className="ordervalue">{order.paymentMode}</span>{' '}
                  </p>
                </div>

                <div className="paymentamount">
                  <p className="orderlabel">Payment Details</p>
                  <div className="total">
                    <p className="ordervalue">Items Subtotal</p>
                    <p className="ordervalue">₹{totals.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="total">
                    <p className="ordervalue">Shipping</p>
                    <p className="ordervalue">₹{totals.shipping.toFixed(2)}</p>
                  </div>
                  <div className="total">
                    <p className="ordervalue">Grand Total</p>
                    <p className="ordervalue">₹{totals.total.toFixed(2)}</p>
                  </div>
                </div>

               
              </div>
            </div>
        <div className="orderinfo">
            <div className="ordercards">
 <div className="buyer-info" >
                <h1 className='ordertitle'>Order Facilitied To - Customer</h1>
                <div className="buyercard">
                    <div className="buyercardleft">
 <Image
                    src={order.buyer?.profileImage || '/placeholder.png'}
                    alt={order.buyer?.name || 'Buyer'}
                    width={50}
                    height={50}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                    </div>
                
                  <div className='ordercardright'>
                  
                    <p>{order.buyer?.name}</p>
                   
                  </div>
                </div>
                
                </div>
                <div className="vendorinfo">
                  
  <h1 className='ordertitle'>Order Facilitied by - Vendor</h1>
    <div className="buyercard">
  {uniqueVendors.length === 0 && <p>No vendor information available.</p>}
  {uniqueVendors.map((vendor) => (
    <div
      key={vendor.id}
      style={{ display: 'flex', alignItems: 'center', gap: 16 }}
    >
      <Image
        src={vendor.profileImage || '/placeholder.png'}
        alt={vendor.name}
        width={50}
        height={50}
        style={{ borderRadius: '10px', objectFit: 'cover' }}
      />
      <div>
        <p className="vendorname">{vendor.name}</p>
        <p className='orderlabel'>{vendor.businessName || '-'}</p>
      </div>
      
    </div>
    
  ))}
</div>
</div>
            </div>
            
        </div>
            <h1 className="yourorder">Order Items ({order.items.length})</h1>
            <div className="orderlistitem" style={{ cursor: 'default' }}>
              {filteredItems.map((item) => (
                <div key={item.id} className="image-wrapper2">
                  <div className="firstsection">
                    <Image
                      src={item.product?.imageUrls?.[0] || '/placeholder.png'}
                      alt={item.product?.title || 'Product'}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 8, marginRight: 16 }}
                    />
                    <div className="ordercontentleft">
                      <h3 className="product-title">{item.product?.title || 'No Title'}</h3>
                     
                    </div>
                  </div>

                  <div className="flexcontainer">
                    <div className="rating-stars staras">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="lucide-star" />
                      ))}
                    </div>
                    <div className="quantity price-section">
                      <p className="price-style">₹{item.totalPrice}</p>
                    </div>
                    <div className="quantity-sec orderquantitypage">
                      <p>Qnty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <OrderTracking
              steps={[
                { label: 'Order Placed', dateTime: new Date(order.placedAt).toLocaleString() },
                { label: 'Dispatch Status', dateTime: order.dispatchStatus },
                // You can enhance this to real tracking steps if API provides
              ]}
            />

            <div className="laststep">
              <button className="bordered-button" onClick={() => alert('Cancel order clicked')}>
                Cancel Order
              </button>
              <button className="bordered-button" onClick={() => alert('Contact support clicked')}>
                Connect with vendor <RiCustomerService2Line />
              </button>
                <button className="bordered-button" onClick={() => alert('Contact support clicked')}>
                Connect with customer <RiCustomerService2Line />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnReplace;
