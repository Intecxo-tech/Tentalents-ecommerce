'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '../auth/callback/AuthContext'; // Assuming the hook is exported from here
import './savedforlater.css'; 
import { ShoppingCart, Trash2 ,Star} from 'lucide-react';

type CartItem = {
  id: string;
  listingId: string;
  productId: string;
  quantity: number;
  savedForLater: boolean;
  vendor: { id: string; name: string };
  product?: {
    id: string;
    title: string;
    imageUrls: string[];
    averageRating?: number | null; // ✅ add this
  };
  productListing?: {
    id: string;
    price: number;
    originalPrice: number; // ✅ fix casing
  };
};


const Page = () => {
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();  // Get user and token from the context
  const CART_API_BASE_URL = 'https://cartservice.zeabur.app';

  const fetchSavedItems = async () => {
    if (!user?.token) {
      toast.error('User is not authenticated.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${CART_API_BASE_URL}/api/cart`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`, // Use token from context
          'Cache-Control': 'no-cache',
        },
      });

      const data = await res.json();
      const filtered = data.data
        .filter((item: CartItem) => item.savedForLater)
        .filter(Boolean);

      setSavedItems(filtered);
    } catch (error) {
      console.error('Error fetching saved items:', error);
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchSavedItems(); // Only fetch if user is logged in
    }
  }, [user?.token]);

  const moveToCart = async (itemId: string) => {
    if (!user?.token) {
      toast.error('User is not authenticated.');
      return;
    }

    try {
      const res = await fetch(`${CART_API_BASE_URL}/api/cart/save-for-later`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`, // Use token from context
        },
        body: JSON.stringify({ itemId, saveForLater: false }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success('Moved back to cart 🛒');
      fetchSavedItems(); // Refresh saved items after moving to cart
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Could not move to cart');
    }
  };

 const deleteItem = async (itemId: string) => {
  if (!user?.token) {
    toast.error('User is not authenticated.');
    return;
  }

  try {
    const res = await fetch(`${CART_API_BASE_URL}/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`, // Use token from context
      },
    });

    if (!res.ok) throw new Error(await res.text());
    toast.success('Item removed 🗑️');
    fetchSavedItems(); // Refresh saved items after deletion
  } catch (error) {
    console.error('Error deleting item:', error);
    toast.error('Could not delete item');
  }
};


  if (loading) return <p>Loading...</p>;

  return (
    <div className="saved-for-later-page">
  

      {savedItems.length === 0 ? (
        <div className="empty-saved">
          <ShoppingCart className="empty-icon" />
          <p>You haven’t saved any items yet.</p>
          <Link href="/shop" className="background-button">Browse Products</Link>
        </div>
      ) : (
       <div className="saved-items-grid">
        {savedItems.map((item) => {
         const { product, productListing } = item;
if (!product || !productListing) return null;

const image = product.imageUrls?.[0] || '';


          return (
            
            <div key={item.id} className="saved-item-card">
              <div className="savelaterleft">
 <Image src={image} alt={product.title} width={80} height={80} />

              <div className="saved-item-details">
                <h3 className='product-title'>{product.title}</h3>
                 <div className="price-main">
  <div className="price-section">
    <p>${Number(productListing.price).toFixed(2)}</p>
    <p className="offer-price">${Number(productListing.originalPrice).toFixed(2)}</p> {/* Fixed spelling */}
  </div>

<div className="rating">

    <p>{(typeof product.averageRating === 'number' ? product.averageRating.toFixed(1) : '0')} <Star size={20}  /></p>

</div>


</div>
              


                {/* Optional: Add rating or vendor info */}
              </div>
              </div>
             

              <div className="saved-item-actions">
                <button
                  className="cart-button background-button "
                  onClick={() => moveToCart(item.id)}
                >
                  <ShoppingCart size={16} /> 
                </button>
                <button
                  className="bordered-button small"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={16} /> 
                </button>
              </div>
            </div>
          );
        
        })
      }</div>
      )}
      
    </div>
  );
};

export default Page;
