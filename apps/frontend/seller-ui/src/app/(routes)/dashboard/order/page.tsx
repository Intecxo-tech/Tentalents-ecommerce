'use client';

import React, { useEffect, useState } from 'react';
import '../../../../shared/components/productaccept/productaccept.css';
import Image from 'next/image';
import { Search , X} from 'lucide-react';
import axios from 'axios';
import './order.css';
import FullOrderPage from '../orderform/Orderform';
import OrderSkeleton from './Orderskeleton';
import {jwtDecode} from 'jwt-decode';
import { Toaster,toast } from 'react-hot-toast';
import ReturnReplace from '../returnreplace/returnReplace';
import ReturnRequestDrawer from '../returnForm/returnRequest';
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
   returnRequest?: boolean;
  refundRequest?: boolean;
  returnRequestId?: string; // add this
  refundRequestId?: string;
  returnRequestStatus?: string; // REQUESTED / APPROVED / REJECTED
  refundRequestStatus?: string; // REQUESTED / APPROVED / REJECTED
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredOrders, setFilteredOrders] = useState<VendorOrder[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
const [selectedReturnRefundId, setSelectedReturnRefundId] = useState<string | null>(null);
const [selectedReturnRefundType, setSelectedReturnRefundType] = useState<'return' | 'refund' | null>(null);

  const getStatusClass = (status: string = '') => {
    const lowerStatus = status.toLowerCase();
    if (['failed', 'not_started', 'cancelled', 'denied'].includes(lowerStatus)) return 'failed';
    if (['pending', 'unpaid'].includes(lowerStatus)) return 'unpaid';
    if (['preparing', 'shipped', 'confirmed', 'dispatched'].includes(lowerStatus)) return 'process';
    if (['paid', 'delivered', 'success'].includes(lowerStatus)) return 'paid';
    return '';
  };
const handleReturnRefundAction = async (
  requestId: string, // <-- change from orderId to requestId
  type: 'return' | 'refund',
  action: 'approved' | 'rejected'
) => {
  try {
   const token = localStorage.getItem('token');
if (token) {
  const decoded: any = jwtDecode(token);
  console.log(decoded.vendorId); // Use this to check vendor
}

    const url =
      type === 'return'
        ? 'https://order-service-322f.onrender.com/api/orders/return-request/status'
        : 'https://order-service-322f.onrender.com/api/orders/refund-request/status'; // if refund has separate route

    await axios.put(
      url,
      {
        returnRequestId: requestId,
        status: action,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

     toast.success(`✅ ${type === 'return' ? 'Return' : 'Refund'} request ${action}`);

    // Update frontend state
   setOrders((prev) =>
  prev.map((o) => {
    // Match either return or refund request ID
    if (
      o.order?.returnRequestId === requestId ||
      o.order?.refundRequestId === requestId
    ) {
      return {
        ...o,
        order: {
          ...o.order!,
          // Update the status field based on type
          returnRequestStatus:
            type === 'return' ? action.toUpperCase() : o.order?.returnRequestStatus,
          refundRequestStatus:
            type === 'refund' ? action.toUpperCase() : o.order?.refundRequestStatus,
        },
      };
    }
    return o;
  })
);

  } catch (err) {
    console.error(`❌ Failed to ${action} ${type} request`, err);
    alert(`Failed to ${action} ${type} request`);
  }
};


useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setLoading(false);
    return;
  }
  const fetchVendorOrders = async () => {
    try {
      const res = await axios.get(
        'https://order-service-322f.onrender.com/api/orders/vendor/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Fetched Orders:', res.data.data);

     const mappedOrders: VendorOrder[] = res.data.data.map((item: any) => {
  const order = item.order || {};

  // Find pending return/refund requests
  const pendingReturnRequest = item.returnRequests?.find(
    (r: any) => r.status === 'REQUESTED'
  );
  const pendingRefundRequest = item.refundRequests?.find(
    (r: any) => r.status === 'REQUESTED'
  );
 const returnRequest = item.returnRequests?.[0];
  const refundRequest = item.refundRequests?.[0];
  return {
    ...item,
    order: {
      ...order,
      // Add boolean flags
      returnRequest: !!pendingReturnRequest,
      refundRequest: !!pendingRefundRequest,
        returnRequestStatus: returnRequest?.status || null, // REQUESTED / APPROVED / REJECTED
      refundRequestStatus: refundRequest?.status || null,
      // Add the actual request IDs from related tables
      returnRequestId: pendingReturnRequest?.id,
      refundRequestId: pendingRefundRequest?.id,
      
    },
  };
});


      setOrders(mappedOrders);
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

if (loading) return <OrderSkeleton />;
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
{orderItem.order?.returnRequestStatus === 'REQUESTED' || orderItem.order?.refundRequestStatus === 'REQUESTED' ? (
  // Show Approve / Cancel buttons only if status is REQUESTED
  <div className="product-buttons">
    <button
      className="center-borderedbutton"
      onClick={() =>
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
        handleReturnRefundAction(
          orderItem.order?.returnRequestStatus === 'REQUESTED'
            ? orderItem.order?.returnRequestId!
            : orderItem.order?.refundRequestId!,
          orderItem.order?.returnRequestStatus === 'REQUESTED' ? 'return' : 'refund',
          'approved'
        )
      }
    >
      Approve <span className="request-label">
    {orderItem.order?.returnRequestStatus === 'REQUESTED'
      ? 'Return'
      : 'Refund'}
  </span>
    </button>
  </div>
) : orderItem.order?.returnRequestStatus === 'APPROVED' ? (
 <button
  className="bordered-button"
  onClick={() => {
    setSelectedReturnRefundId(orderItem.order?.id || '');
    setSelectedItemId(orderItem.product?.id || '');   // ✅ Pass product/item ID
    setSelectedReturnRefundType('return');
  }}
>
  View Return Status
</button>
) : orderItem.order?.refundRequestStatus === 'APPROVED' ? (
  <button
    className="bordered-button"
    onClick={() => {
      setSelectedReturnRefundId(orderItem.order?.id || '');
      setSelectedReturnRefundType('refund');
    }}
  >
    View Refund Status
  </button>

) : orderItem.order?.returnRequestStatus === 'REJECTED' || orderItem.order?.refundRequestStatus === 'REJECTED' ? (
  // Show Rejected label if rejected
  <span className="bordered-button">Rejected</span>
)  : isPending ? (
    // 🟡 Pending
    <div className="product-buttons">
      <button
        className="center-borderedbutton"
        onClick={() => handleDeny(orderItem.id)}
      >
        Deny
      </button>
      <button
        className="background-buttonver"
        onClick={() => handleConfirm(orderItem.id)}
      >
        Confirm
      </button>
    </div>
  ) : isPreparing ? (
    // 🚚 Preparing
    <div className="product-buttons">
      <button
        className="center-borderedbutton"
        onClick={() => handleViewOrder(orderItem.order?.id || '')}
      >
        Track Order
      </button>
    </div>
  ) : isConfirmed ? (
    // ✅ Confirmed
    <div className="product-buttons">
      <button
        className="center-borderedbutton"
        onClick={() => handleViewStatus(orderItem.id)}
      >
        View Status
      </button>
    </div>
  ) : isDispatched ? (
    // 📦 Shipped
    <div className="product-buttons">
      <button
        className="center-borderedbutton"
        onClick={() => handleViewOrder(orderItem.order?.id || '')}
      >
        View Order
      </button>
    </div>
  ) : isFinished ? (
    // 🏁 Delivered / Returned / Refunded
    <div className="product-buttons">
      <button
        className="center-borderedbutton"
        onClick={() => handleViewOrder(orderItem.order?.id || '')}
      >
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
    selectedOrder={orders.find((o) => o.order?.id === selectedOrderId) ?? null}
  />
)}

{selectedReturnRefundId && selectedReturnRefundType && selectedItemId && (
  <ReturnRequestDrawer
    selectedOrderId={selectedReturnRefundId}
    selectedOrder={
      orders.find(
        (o) =>
          o.order?.id === selectedReturnRefundId &&
          o.product?.id === selectedItemId
      ) ?? null
    }
    onClose={() => {
      setSelectedReturnRefundId(null);
      setSelectedReturnRefundType(null);
      setSelectedItemId(null);
    }}
  />
)}



    </div>
  );
};

export default Page;
