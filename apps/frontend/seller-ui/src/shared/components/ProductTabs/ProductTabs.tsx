'use client';

import React, { useEffect, useState } from 'react';
import './ProductTabs.css';
import ProductAccept from '../productaccept/ProductAccept';
import { FaBox } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';

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


// --- API Logic (Updated to accept and use currentVendorId) ---

const VENDOR_API_URL = "https://order-service-322f.onrender.com/api/orders/vendor/orders";
const ADMIN_API_URL = "https://admin-service-k0id.onrender.com/api/admin/sellers/all-with-products"; 


async function fetchOrdersByRole(token: string, role: string, currentVendorId: string | undefined): Promise<VendorOrder[]> {
    if (role === 'admin') {
        // 🔥 CRITICAL FILTERING STEP FOR ADMIN ROLE
        if (!currentVendorId) {
            console.error("Admin role detected but currentVendorId is missing for scoping. Returning no orders.");
            return [];
        }

        console.log(`Admin role detected. Filtering orders for Vendor ID: ${currentVendorId}`);
        const response = await fetch(ADMIN_API_URL, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch admin orders');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Admin API returned an error');
        }

        const allVendors = data.data as any[];
        const adminOrders: VendorOrder[] = [];

        // 1. Find the specific vendor
        const currentVendor = allVendors.find(vendor => vendor.id === currentVendorId);

        if (!currentVendor) {
            console.log(`Vendor ID ${currentVendorId} not found in Admin API response.`);
            return [];
        }

        // 2. Create a Product Map for the specific vendor's listings
        const productMap: Map<string, Product> = new Map();
        currentVendor.productListings?.forEach((listing: any) => {
            if (listing.product) {
                productMap.set(listing.productId, {
                    id: listing.product.id,
                    title: listing.product.title,
                    imageUrls: listing.product.imageUrls,
                });
            }
        });

        // 3. Process only this vendor's orderItems
        currentVendor.orderItems?.forEach((orderItem: any) => {
            
            const order: Order = {
                id: orderItem.order.id,
                status: orderItem.order.status,
                paymentStatus: orderItem.order.paymentStatus,
                createdAt: orderItem.order.placedAt,
                dispatchStatus: orderItem.order.dispatchStatus,
                shippingAddress: {
                 city: orderItem.order.shippingAddress.city,
                }
            };
            
            // 4. Lookup the product details using productId
            const product: Product | undefined = productMap.get(orderItem.productId);

            adminOrders.push({
                id: orderItem.id,
                quantity: orderItem.quantity,
                totalPrice: orderItem.totalPrice,
                dispatchStatus: orderItem.dispatchStatus,
                product: product,
                order: order,
                createdAt: orderItem.order.placedAt,
            });
        });

        return adminOrders;

    } else {
        // Default Vendor API Call (original logic)
        console.log("Vendor role or default role detected. Fetching orders from Vendor API.");
        const response = await fetch(VENDOR_API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch vendor orders');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Vendor API returned an error');
        }
        return data.data as VendorOrder[];
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

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      // 1. Determine the user's role and the target Vendor ID
      let userRole: string = 'vendor';
      let targetVendorId: string | undefined = propVendorId; // Use passed prop first
      
      try {
          const decoded = jwtDecode<TokenPayload>(token);
          userRole = decoded.role || 'vendor';

          // Fallback: If no prop is passed, use the vendorId from the token (for regular vendor dashboard)
          if (!targetVendorId) { 
              targetVendorId = decoded.vendorId;
          }

      } catch (e) {
          console.error("Failed to decode JWT in ProductTabs:", e);
          setError("Authentication token is invalid.");
          setLoading(false);
          return;
      }
      
      try {
        // 2. Call the fetch function with the determined Vendor ID
        const fetchedOrders = await fetchOrdersByRole(token, userRole, targetVendorId);
        setAllOrders(fetchedOrders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [propVendorId]); // Re-run effect when the target vendor changes

  const filterOrders = (tab: TabType) => {
    // ... (Filter logic is unchanged and remains correct) ...
    switch (tab) {
        case 'New':
            return allOrders.filter(item => item.order?.status?.toLowerCase() === 'pending');
        case 'In Process':
            return allOrders.filter(item => {
                const orderStatus = item.order?.status?.toLowerCase();
                const dispatchStatus = item.dispatchStatus?.toLowerCase() || item.order?.dispatchStatus?.toLowerCase();
                return orderStatus === 'confirmed' || dispatchStatus === 'preparing' || dispatchStatus === 'dispatched' || orderStatus === 'shipped';
            });
        case 'Completed':
            return allOrders.filter(item =>
                ['delivered', 'cancelled', 'refunded', 'returned'].includes(item.order?.status?.toLowerCase() || '')
            );
        default:
            return allOrders;
    }
  };

  const filteredOrders = filterOrders(activeTab);


  if (error) return <div>Error: {error}</div>;

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


      {error ? (
      <div className="error-message">Error: {error}</div>
    ) : (
        // Pass orders, which will be undefined only during initial loading
      <ProductAccept orders={loading ? undefined : filteredOrders} />
    )}
    </div>
  );
};

export default ProductTabs;