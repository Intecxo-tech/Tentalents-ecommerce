'use client';

import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import '../../home-page/productlist/Productlist';
import './quantityadded.css';

type ProductsProps = {
  listCount?: number;
};

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

const QuantityAdded = ({ listCount = 2 }: ProductsProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const CART_API_BASE_URL = process.env.NEXT_PUBLIC_CART_API_LINK ?? 'https://cart-service-5lo3.onrender.com';

  useEffect(() => {
    fetchCartItems();
  }, []);

  async function fetchCartItems() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`https://cart-service-5lo3.onrender.com/api/cart`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch cart');

      const data = await res.json();

      const validItems = data.data
        .map((item: CartItem) => {
          const parsedPrice =
            typeof item.productListing?.price === 'number'
              ? item.productListing.price
              : parseFloat(item.productListing?.price || '0');

          if (
            item.product &&
            item.productListing &&
            Array.isArray(item.product.imageUrls) &&
            item.product.imageUrls.length > 0 &&
            typeof item.product.title === 'string' &&
            !isNaN(parsedPrice)
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

      setCartItems(validItems.slice(0, listCount));
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }

  return (
    <div className="quantitycard">
      <div className="quantityheader">
        <h3 className="sectiontitle">Your Cart</h3>
        <Link href="/cart">
          <button className="bordered-button">Edit <Pencil /></button>
        </Link>
      </div>

      <div className="product-list">
        {cartItems.map((item, index) => {
          const product = item.product;
          const listing = item.productListing;
          if (!product || !listing) return null;

          const image = product.imageUrls[0];
          const hasDiscount = false; // You can add discount logic if needed

          return (
            <div key={index}>
              <Link href={`/product/${product.id}`}>
                <div className="product-list-item">
                  <div className="image-wrapper2">
                    <Image
                      src={image}
                      alt={product.title}
                      className="product-image"
                      fill
                    />
                  </div>
                  <div className="content-area2">
                    <h3 className="product-title">{product.title}</h3>
                    <div className="quantityprice">
                      <div className="quantityprice-section">
                        <p className="price-style">${listing.price.toFixed(2)}</p>
                        {hasDiscount && (
                          <p className="offerprice-style">${/* listing.offerPrice */}</p>
                        )}
                      </div>
                      <div className="quantity-sec">
                        <p>Qnty:{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuantityAdded;
