'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './product.css';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import Link from 'next/link';
import Products from 'apps/frontend/seller-ui/src/shared/components/noproducts/products';
interface Variant {
  id: string;
  name: string;
  value: string;
}

interface Listing {
  id: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  variants: Variant[];
}

interface Product {
    slug: string;
  id: string;
  title: string;
  category: string;
   href: string;
  imageUrls: string[];
  listings: Listing[];
}

const Page: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendorProducts() {
      try {
        setLoading(true);
        const response = await axios.get('https://product-service-23pc.onrender.com/api/products/vendor/products', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProducts(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch products');
        setLoading(false);
      }
    }

    fetchVendorProducts();
  }, []);

  function handleEdit(productId: string) {
    router.push(`/dashboard/editproduct/${productId}`);
  }

  async function handleDelete(productId: string) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`https://product-service-23pc.onrender.com/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert('Product deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  }

  if (loading) return <div>Loading your products...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  if (products.length === 0) {
    return <div>You have no products yet. Create one!</div>;
  }

  return (
    <div className="product-grid columns-4">
     
      {products.map((product) => {
        const listing = product.listings[0];
        if (!listing) return null;

        const price = Number(listing.price);
        const originalPrice = Number(listing.originalPrice);
        const hasDiscount = originalPrice > price;
        const discountPercent = hasDiscount
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

        return (
<Link href={`/dashboard/store/${product.slug}`} key={product.id}>
    <div className="product-card">
            <div className="image-wrapper">
              {hasDiscount && (
                <p className="discount">{discountPercent}% OFF</p>
              )}
              <img
                src={product.imageUrls?.[0] || '/placeholder.png'}
                alt={product.title}
                className="product-image"
              />
            </div>

            <h3 className="product-title">{product.title}</h3>

            <div className="price-main">
              <div className="price-section">
                <p>${price.toFixed(2)}</p>
                {hasDiscount && (
                  <p className="offer-price">${originalPrice.toFixed(2)}</p>
                )}
              </div>

              <div className="rating">
                <p>4.5</p>
                <span><Star className='text-[grey]' /></span>
                <p className="number">(100)</p>
              </div>
            </div>
{/* 
            <div className="card-actions">
              <button className='background-button' onClick={() => handleEdit(product.id)}>Edit</button>
              <button className='backgroundwhite-button' onClick={() => handleDelete(product.id)}>Delete</button>
            </div> */}
          </div>
             </Link>
        );
      })}
   
    </div>
  );
};

export default Page;
