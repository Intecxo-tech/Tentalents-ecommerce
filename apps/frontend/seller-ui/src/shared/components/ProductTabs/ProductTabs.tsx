'use client';

import React, { useEffect, useState } from 'react';
import './ProductTabs.css';
import ProductAccept from '../productaccept/ProductAccept';
import { FaBox } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

// --- Interfaces ---
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
  createdAt: string;
  paymentMethod?: string;
  dispatchStatus?: string;
  shippingAddress?: ShippingAddress;
  returnRequest?: boolean;
  refundRequest?: boolean;
  returnRequestId?: string;
  refundRequestId?: string;
  returnRequestStatus?: string;
  refundRequestStatus?: string;
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
interface TokenPayload { 
  role?: string;
  vendorId?: string;
  [key: string]: any;
}
interface ProductTabsProps {
  vendorId?: string; // Prop passed from the parent Admin view-as page
}

// --- API URLs ---
const VENDOR_API_URL = "https://orderservice.zeabur.app/api/orders/vendor/orders";
const ADMIN_API_URL = "https://adminservice.zeabur.app/api/admin/sellers/all-with-products"; 

// --- Fetch Orders Function ---
async function fetchOrdersByRole(token: string, role: string, currentVendorId: string | undefined): Promise<VendorOrder[]> {
  if (role === 'admin') {
    if (!currentVendorId) return [];

    const response = await fetch(ADMIN_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch admin orders');

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Admin API returned error');

    const currentVendor = data.data.find((v: any) => v.id === currentVendorId);
    if (!currentVendor) return [];

    const productMap: Map<string, Product> = new Map();
    currentVendor.productListings?.forEach((listing: any) => {
      if (listing.product) {
        productMap.set(listing.productId, { id: listing.product.id, title: listing.product.title, imageUrls: listing.product.imageUrls });
      }
    });

    return currentVendor.orderItems?.map((item: any) => {
      const order: Order = {
        id: item.order.id,
        status: item.order.status,
        paymentStatus: item.order.paymentStatus,
        createdAt: item.order.placedAt,
        dispatchStatus: item.order.dispatchStatus,
        shippingAddress: { city: item.order.shippingAddress.city },
        returnRequest: !!item.returnRequests?.find((r: any) => r.status === 'REQUESTED'),
        refundRequest: !!item.refundRequests?.find((r: any) => r.status === 'REQUESTED'),
        returnRequestStatus: item.returnRequests?.[0]?.status || null,
        refundRequestStatus: item.refundRequests?.[0]?.status || null,
        returnRequestId: item.returnRequests?.find((r: any) => r.status === 'REQUESTED')?.id,
        refundRequestId: item.refundRequests?.find((r: any) => r.status === 'REQUESTED')?.id,
      };
      return {
        id: item.id,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        dispatchStatus: item.dispatchStatus,
        product: productMap.get(item.productId),
        order,
        createdAt: item.order.placedAt,
      };
    }) || [];
  } else {
    // Vendor role
    const response = await fetch(VENDOR_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch vendor orders');
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Vendor API returned error');

    return data.data.map((item: any) => ({
      ...item,
      order: {
        ...item.order,
        returnRequest: !!item.returnRequests?.find((r: any) => r.status === 'REQUESTED'),
        refundRequest: !!item.refundRequests?.find((r: any) => r.status === 'REQUESTED'),
        returnRequestStatus: item.returnRequests?.[0]?.status || null,
        refundRequestStatus: item.refundRequests?.[0]?.status || null,
        returnRequestId: item.returnRequests?.find((r: any) => r.status === 'REQUESTED')?.id,
        refundRequestId: item.refundRequests?.find((r: any) => r.status === 'REQUESTED')?.id,
      },
    }));
  }
}

// --- Component Logic ---
const tabs = ['All', 'New', 'In Process', 'Completed'] as const;
type TabType = typeof tabs[number];

const ProductTabs = ({ vendorId: propVendorId }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [allOrders, setAllOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Load Orders ---
  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setError("User not authenticated."); setLoading(false); return; }

      let userRole: string = 'vendor';
      let targetVendorId: string | undefined = propVendorId;

      try {
        const decoded = jwtDecode<TokenPayload>(token);
        userRole = decoded.role || 'vendor';
        if (!targetVendorId) targetVendorId = decoded.vendorId;
      } catch {
        setError("Invalid token."); setLoading(false); return;
      }

      try {
        const fetchedOrders = await fetchOrdersByRole(token, userRole, targetVendorId);
        setAllOrders(fetchedOrders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [propVendorId]);

  // --- Handle Approve/Reject Return/Refund ---
  const handleReturnRefundAction = async (requestId: string, type: 'return' | 'refund', action: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = type === 'return'
        ? 'https://orderservice.zeabur.app/api/orders/return-request/status'
        : 'https://orderservice.zeabur.app/api/orders/refund-request/status';

      await axios.put(url, { returnRequestId: requestId, status: action }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`${type === 'return' ? 'Return' : 'Refund'} request ${action}`);

      // Update frontend state
      setAllOrders(prev =>
        prev.map(o => {
          if (o.order?.returnRequestId === requestId || o.order?.refundRequestId === requestId) {
            return {
              ...o,
              order: {
                ...o.order!,
                returnRequestStatus: type === 'return' ? action.toUpperCase() : o.order?.returnRequestStatus,
                refundRequestStatus: type === 'refund' ? action.toUpperCase() : o.order?.refundRequestStatus,
              },
            };
          }
          return o;
        })
      );

    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} ${type} request`);
    }
  };

  // --- Filter Orders ---
  const filterOrders = (tab: TabType) => {
    switch (tab) {
      case 'New':
        return allOrders.filter(item => item.order?.status?.toLowerCase() === 'pending');
      case 'In Process':
        return allOrders.filter(item => {
          const orderStatus = item.order?.status?.toLowerCase();
          const dispatchStatus = item.dispatchStatus?.toLowerCase() || item.order?.dispatchStatus?.toLowerCase();
          return orderStatus === 'confirmed' || ['preparing','dispatched','shipped'].includes(dispatchStatus || '');
        });
      case 'Completed':
        return allOrders.filter(item =>
          ['delivered','cancelled','refunded','returned'].includes(item.order?.status?.toLowerCase() || '')
        );
      default:
        return allOrders;
    }
  };

  const filteredOrders = filterOrders(activeTab);

  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div>
      <div className='product-tabs-header'>
        <div className='product-tabs-title'>
          <FaBox className='titleicon' />
          <h2 className='mainheading'>Orders</h2>
        </div>
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <ProductAccept 
        orders={loading ? undefined : filteredOrders} 
        handleReturnRefundAction={handleReturnRefundAction} 
      />
      <Toaster />
    </div>
  );
};

export default ProductTabs;

