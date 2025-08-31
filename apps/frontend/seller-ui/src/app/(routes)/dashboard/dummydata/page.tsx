'use client'
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:3002/api/orders/vendor/orders";

// Define interfaces based on your JSON response shape
interface Product {
  id: string;
  title: string;
  description?: string;
  category?: string;
  imageUrls?: string[];
  [key: string]: any; // For other optional properties
}

interface Buyer {
  name?: string | null;
  email?: string | null;
}

interface ShippingAddress {
  id: string;
  userId: string;
  vendorId: string;
  name: string;
  phone: string | null;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  addressLine2?: string | null;
  addressType?: string;
  [key: string]: any;
}

interface Order {
  id: string;
  buyerId: string;
  totalAmount: string;
  status: string;
  paymentMode: string;
  paymentRef?: string | null;
  placedAt: string;
  updatedAt?: string;
  shippingAddressId: string;
  paymentStatus?: string;
  stripePaymentIntentId?: string | null;
  dispatchStatus?: string;
  dispatchTime?: string | null;
  shippingAddress?: ShippingAddress;
  buyer?: Buyer;
  [key: string]: any;
}

interface VendorOrder {
  id: string;
  orderId: string;
  productId: string;
  listingId: string;
  vendorId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  addedAt: string;
  dispatchStatus: string;
  dispatchTime?: string | null;
  shippingCost?: string;
  product?: Product;
  order?: Order;
}

async function fetchVendorOrders(token: string): Promise<VendorOrder[]> {
  console.log("🚀 Sending request to fetch orders..."); // Log: Request is being sent

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ API request failed:", errorData); // Log: API error response
    throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    console.error("❌ API returned 'success: false':", data.message); // Log: API logical error
    throw new Error(data.message || "API returned an error");
  }

  console.log("✅ Orders fetched successfully from API."); // Log: Successful fetch
  return data.data as VendorOrder[];
}

const VendorOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   const loadOrders = async () => {
    console.log("🔄 Component mounted, attempting to fetch orders...");

    // BEFORE THE FIX ❌
    // const token = localStorage.getItem("authToken");

    // AFTER THE FIX ✅
    const token = localStorage.getItem("token"); // Change "authToken" to "token"

    if (!token) {
      console.warn("🔴 No token found in localStorage. User is not authenticated.");
      setError("User is not authenticated. Please log in.");
      setLoading(false);
      return;
    }

      console.log("🔑 Token fetched from localStorage:", token.substring(0, 15) + "..."); // Log the first 15 chars of the token

      try {
        const fetchedOrders = await fetchVendorOrders(token);
        setOrders(fetchedOrders);
        console.log("📦 Vendor orders have been set to the component state.", fetchedOrders);
      } catch (err: any) {
        console.error("💥 An error occurred during the fetch process:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);


  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Vendor Orders</h1>
      {orders.length === 0 && <p>No orders found.</p>}
      {orders.map((orderItem) => {
        const {
          id,
          quantity,
          totalPrice,
          status,
          addedAt,
          dispatchStatus,
          product,
          order,
        } = orderItem;

        return (
          <div
            key={id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "5px",
            }}
          >
            <h2>Product: {product?.title || "No product title"}</h2>
            <p>
              <strong>Quantity:</strong> {quantity ?? "N/A"}
            </p>
            <p>
              <strong>Total Price:</strong> ${totalPrice ?? "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {status || "N/A"}
            </p>
            <p>
              <strong>Added At:</strong>{" "}
              {addedAt ? new Date(addedAt).toLocaleString() : "N/A"}
            </p>
            <p>
              <strong>Dispatch Status:</strong> {dispatchStatus || "N/A"}
            </p>

            <h3>Order Details</h3>
            <img
  src={product?.imageUrls?.[0] || '/placeholder.png'} // Safely access the first image
  alt={product?.title || 'Product Image'}
  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
/>
            <p>

              <strong>Order ID:</strong> {order?.id || "N/A"}
            </p>
            <p>
              <strong>Buyer Email:</strong> {order?.buyer?.email || "N/A"}
            </p>
            <p>
              <strong>Order Status:</strong> {order?.status || "N/A"}
            </p>
            <p>
              <strong>Payment Mode:</strong> {order?.paymentMode || "N/A"}
            </p>
<p>
    <strong>DIspatch STatus:{order?.dispatchStatus}</strong>
</p>
<p>
  <strong>Payment Status:</strong> {order?.paymentStatus || "N/A"}
</p>
            <p>
              <strong>Placed At:</strong>{" "}
              {order?.placedAt
                ? new Date(order.placedAt).toLocaleString()
                : "N/A"}
            </p>

            <h4>Shipping Address</h4>
            <p>{order?.shippingAddress?.name || "N/A"}</p>
            <p>
              {order?.shippingAddress?.addressLine1 || "N/A"}
              {order?.shippingAddress?.addressLine2
                ? `, ${order.shippingAddress.addressLine2}`
                : ""}
            </p>
            <p>
              {order?.shippingAddress?.city || "N/A"},{" "}
              {order?.shippingAddress?.state || "N/A"} -{" "}
              {order?.shippingAddress?.pinCode || "N/A"}
            </p>
            <p>{order?.shippingAddress?.country || "N/A"}</p>
            <p>Phone: {order?.shippingAddress?.phone || "N/A"}</p>
          </div>
        );
      })}
    </div>
  );
};

export default VendorOrdersPage;
