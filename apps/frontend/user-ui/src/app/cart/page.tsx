'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Minus, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Products from '../home-page/products-grid/productsgrid';
import { ShoppingCart } from 'lucide-react';
import './cart.css';
import '../shop/[slug]/singleproductpage.css'; // For additional product styles
import toast from 'react-hot-toast';
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
     shippingCost?: number;  
  };
};

type ApiCartResponse = {
  data: CartItem[];
};

const Cart = () => {
  const CART_API_BASE_URL =  `https://cart-service-kona.onrender.com`;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchCart();
  }, []);

async function fetchCart() {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // 1. Create a unique parameter to "bust" the cache
    const cacheBuster = `_=${new Date().getTime()}`;

    // 2. Add the cache-busting parameter to your fetch URL
    const res = await fetch(`https://cart-service-kona.onrender.com/api/cart?${cacheBuster}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache', // Still good to keep this
      },
      cache: 'no-store', // And this one too
    });

    if (!res.ok) throw new Error('Failed to fetch cart');

    const responseData = await res.json();
    console.log('Cart API Raw Data:', responseData.data);
    
    // Check if data is null or undefined after clearing
    const itemsToFilter = responseData.data || [];

   const filtered = itemsToFilter
  .map((item: CartItem) => {
    if (item.productListing && typeof item.productListing.price === 'string') {
      item.productListing.price = parseFloat(item.productListing.price);
    }
    return item;
  })
  .filter(Boolean) as CartItem[];

    setCartItems(filtered);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    setCartItems([]);
  } finally {
    setLoading(false);
  }
}
// Inside Cart component

async function updateQuantity(listingId: string, currentQty: number, change: number) {
  const newQty = currentQty + change;
  if (newQty < 1) return;

  const originalItems = [...cartItems];

  // Optimistically update UI immediately
  setCartItems((prevItems) =>
    prevItems.map((item) =>
      item.listingId === listingId ? { ...item, quantity: newQty } : item
    )
  );

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${CART_API_BASE_URL}/api/cart/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ listingId, quantityChange: change }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    // OPTIONAL: update with API response if needed
    const updatedResponse = (await res.json()) as ApiCartResponse;

  const updatedItems = Array.isArray(updatedResponse.data)
  ? updatedResponse.data
      .map((item: CartItem) => {
        const parsedPrice =
          typeof item.productListing?.price === 'number'
            ? item.productListing.price
            : parseFloat(item.productListing?.price || '0');

        if (
          item.productListing &&
          !isNaN(parsedPrice) &&
          item.product &&
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
      .filter(Boolean) as CartItem[]
  : [];

    setCartItems(updatedItems);
  } catch (error) {
    console.error('Failed to update quantity:', error);
    // Revert on error
    setCartItems(originalItems);
  }
}


  const subtotal = cartItems.reduce((acc, item) => {
  const price = item.productListing?.price ?? 0;
  return acc + price * item.quantity;
}, 0);
useEffect(() => {
  const handleFocus = () => {
    fetchCart(); // Re-fetch cart when tab regains focus
  };

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);

const hasItems = cartItems.length > 0;

const shippingFee = cartItems.reduce((acc, item) => {
  const shipping = item.productListing?.shippingCost ?? 0;
  return acc + shipping * item.quantity;
}, 0);

const platformFee = hasItems ? 4.0 : 0;
const total = subtotal + shippingFee + platformFee;
  return (
    <div className="cartpage">
      <div className="cart-section">
        <div className="cartsection-left">
          <div className="product-list">
            { cartItems.length === 0 && !loading ? (
    <div className="empty-cart">
      <ShoppingCart className='shopping-carticon' />
      <p>Your cart is empty.</p>
      {/* Optional: Add an image or link to shop */}
      <Link href="/shop" className="background-button">
        Continue Shopping
      </Link>
    </div>
  ) : (
            cartItems.map((item) => {
              const product = item.product;
              const listing = item.productListing;
              if (!product || !listing) return null;

              const productImage = product.imageUrls[0];

              return (
                <div key={item.id} className="productcart">
                  <div className="productcart-image">
                    <Link href={`/product/${product.id}`}>
                      <Image
                        src={productImage}
                        alt={product.title}

                        width={65}
                        height={65}
                       
                        className="product-image cartproduct-image"
                      />
                    </Link>
                   
              <div className="cartcontentarea">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="product-title">{product.title}</h3>
                      </Link>

                      <div className="price-main">
                        <div className="price-section">
                          <p>${listing.price.toFixed(2)}</p>
                        </div>
                        <div className="saveforlater">
                          <button type="button">Save for later</button>
                        </div>
                      </div>
                    </div>
                     </div>

                  <div className="detailcart">
                 
                  
                    <div className="adtocart-wrapper2">
                      <div className="counter">
                     <button
  type="button"
  onClick={() => updateQuantity(item.listingId, item.quantity, -1)}
  className="icon-button"
  aria-label="Decrease quantity"
>
  <Minus className="counter-icon" />
</button>

<input type="number" value={item.quantity} readOnly />

<button
  type="button"
  onClick={() => updateQuantity(item.listingId, item.quantity, 1)}
  className="icon-button"
  aria-label="Increase quantity"
>
  <PlusIcon className="counter-icon" />
</button>

                      </div>
                    </div>

                    <div className="orderprice">
                      <p className="original-price cartprice">
                        ${(listing.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        <div className="cartsection-right">
          <div className="coupon-section applysection">
            <form>
              <input
                type="text"
                className="coupon-text"
                placeholder="Apply Coupon Code"
                aria-label="Coupon Code"
              />
              <button type="submit" className="bordered-button couponbutton">
                Apply
              </button>
            </form>
          </div>

          <div className="subtotal-section">
            <div className="subtotal">
              <h2>Subtotal</h2>
              <p>${subtotal.toFixed(2)}</p>
            </div>

            <div className="subtotal">
              <h2>Shipping</h2>
              <p>${shippingFee.toFixed(2)}</p>
            </div>

            <div className="subtotal">
              <h2>Platform Fee</h2>
              <p>${platformFee.toFixed(2)}</p>
            </div>

            <div className="subtotal total">
              <h2 className="alltotal">Total</h2>
              <p>${total.toFixed(2)}</p>
            </div>

          <div className="checkout">
  {hasItems ? (
    <Link href="/cart/checkout" className="background-button checkoutbutton">
      Checkout <ChevronRight />
    </Link>
  ) : (
    <button
      className="background-button checkoutbutton"
      onClick={() => {
        toast.error("Your cart is empty. Add items to proceed to checkout.");
      }}
    >
      Checkout <ChevronRight />
    </button>
  )}
</div>


          </div>
        </div>
      </div>

      <Products />
    </div>
  );
};

export default Cart;


