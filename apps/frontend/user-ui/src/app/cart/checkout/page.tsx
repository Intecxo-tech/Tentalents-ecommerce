'use client';
import React, { useState, useEffect } from 'react';
import Address from '../components/addaddress/Address';
import Payment from '../components/paymentmethod/payment';
import QuantityAdded from '../components/quantity added/quantityadded';
import './checkout.css';
import '../cart.css';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {initiatePayment,verifyPayment, sendPaymentStatus } from '../../../services/Payment'

// Replace with your actual public Stripe key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''); // Public Key for Stripe Checkout

type CartItem = {
  id: string;
  listingId: string;
  productId: string;
  quantity: number;
  vendor: { id: string; name: string };
  product?: {
    id: string;
    title: string;
    description?: string;
    imageUrls: string[];
    category?: string;
    brand?: string;
  };
  productListing?: {
    id: string;
    price: number;
    stock?: number;
    sku?: string;
    status?: string;
  };
};

const Page = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null); 
      const [orderId, setOrderId] = useState<string | null>(null);

  const NEXT_PUBLIC_ORDER_API_LINK = `https://order-service-faxh.onrender.com`;
  const NEXT_PUBLIC_CART_API_LINK = `https://cart-service-5lo3.onrender.com`;

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        return;
      }

      const res = await fetch(`https://cart-service-5lo3.onrender.com/api/cart`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch cart');

      const data = await res.json();

      const filteredItems = data.data
        .map((item: CartItem) => {
          const parsedPrice =
            typeof item.productListing?.price === 'number'
              ? item.productListing.price
              : parseFloat(item.productListing?.price || '0');

          if (
            item.product &&
            item.productListing &&
            !isNaN(parsedPrice) &&
            Array.isArray(item.product.imageUrls) &&
            item.product.imageUrls.length > 0 &&
            typeof item.product.title === 'string'
          ) {
            return {
              ...item,
              productListing: {
                ...item.productListing,
                price: parsedPrice,
              },
            };
          }
          return null;
        })
        .filter(Boolean) as CartItem[];

      setCartItems(filteredItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productListing?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = 54;
  const platformFee = 4;
const total = subtotal > 0 ? subtotal + shippingFee + platformFee : 0;

  const vendorId = cartItems.length > 0 ? cartItems[0].vendor.id : '';


const handlePlaceOrder = async (selectedPaymentMode: string, selectedAddress: string | null) => {
  if (!selectedAddress) {
    toast.error('Please select or add a delivery address!');
    return;
  }
  if (!selectedPaymentMode) {
    toast.error('Please choose a payment method!');
    return;
  }
  
  const token = localStorage.getItem('token');
  const orderData = {
    items: cartItems.map((item) => ({
      productId: item.productId,
      vendorId: item.vendor.id,
      listingId: item.listingId,
      quantity: item.quantity,
      price: Number((item.productListing?.price ?? 0).toFixed(2)),
    })),
    totalAmount: subtotal,
    shippingAddressId: selectedAddress,
    paymentMode: selectedPaymentMode,
  };

 try {
  const res = await fetch(`https://order-service-faxh.onrender.com/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const text = await res.text();

  console.log('[ORDER] Status:', res.status);
  console.log('[ORDER] Raw response:', text);

  if (!res.ok) {
    throw new Error(`[ORDER] Failed with status ${res.status}: ${text}`);
  }

  const data = JSON.parse(text);
  console.log('[ORDER] Parsed response:', data);

if (selectedPaymentMode === 'credit_card' && data?.data?.checkoutUrl) {
  console.log('[ORDER] Redirecting to Stripe URL:', data.data.checkoutUrl);
  window.location.href = data.data.checkoutUrl;
}
 else if (selectedPaymentMode === 'cash_on_delivery') {
    toast.success('Order placed successfully!');
  } else {
    toast.error('Unexpected payment response!');
    console.log('[ORDER] No checkoutUrl found in response.');
  }
} catch (error) {
  console.error('[ORDER] Error placing order:', error);
  toast.error('Failed to place order!');
}

}
const handlePaymentStatus = async (paymentId: string, signature: string) => {
  try {
    // First, verify payment status by calling the backend endpoint
    const paymentVerification = await verifyPayment(paymentId, orderId!, signature);  // Pass orderId to verify payment

    // Once you have the payment verification status
    if (paymentVerification.status === 'success') {
      // If payment is successful, send the success status to backend
      await sendPaymentStatus(orderId!, 'success');
      setPaymentStatus('success');
      toast.success('Payment successful! Order confirmed.');
    } else {
      // If payment fails, send the failed status to backend
      await sendPaymentStatus(orderId!, 'failed');
      setPaymentStatus('failed');
      toast.error('Payment failed! Please try again.');
    }
  } catch (error) {
    toast.error('Error confirming payment status!');
  }
};

  return (
    <div>
      <div className="deliverylocation">
        <div className="checkoutleft">
          <Address
            showLocate={false}
            vendorId={vendorId}
            setAddress={setAddress}
          />
          <Payment
  onPaymentModeSelect={setPaymentMode}
  total={total}
  onConfirmPayment={(selectedPaymentMode) => {
    // Validate address + paymentMode before placing order
    if (!address) {
      toast.error('Please select or add a delivery address!');
      return;
    }
    if (!selectedPaymentMode) {
      toast.error('Please choose a payment method!');
      return;
    }
    setPaymentMode(selectedPaymentMode);
    handlePlaceOrder(selectedPaymentMode, address);
  }}
/>
</div>

        <div className="checkoutright">
          <div className="subtotal-section">
            <div className="subtotal">
              <h2>Subtotal</h2>
              <p>${subtotal.toFixed(2)}</p>
            </div>
             {cartItems.length > 0 && (
      <>
            <div className="subtotal">
              <h2>Shipping</h2>
              <p>${shippingFee.toFixed(2)}</p>
            </div>
            <div className="subtotal">
              <h2>Platform Fee</h2>
              <p>${platformFee.toFixed(2)}</p>
            </div>
          </>
          )}
            <div className="subtotal total">
              <h2 className="alltotal">Total</h2>
              <p>${cartItems.length > 0
        ? total.toFixed(2)
        : '0.00'}</p>
            </div>
          </div>

          <QuantityAdded />
          {/* <button onClick={handlePlaceOrder} className="background-button">
            Place Order
          </button> */}
        </div>
      </div>
    </div>
    
  );
};

export default Page;

