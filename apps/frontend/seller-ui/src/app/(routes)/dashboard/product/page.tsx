'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './product.css';
// You can remove useSearchParams if you are relying on the prop from the parent
import { Star } from 'lucide-react';
import Link from 'next/link';
import ProductSkeleton from './ProductSkeleton';

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

// 1. ✅ RESTORE THE INTERFACE
interface ProductProps {
  searchQuery: string;
}

// 2. ✅ ACCEPT THE PROP IN THE COMPONENT
const Page = ({ searchQuery }: ProductProps) => {
  // const router = useRouter(); // Optional if not used
  
  // 3. ❌ REMOVE useSearchParams (The parent is passing the data directly)
  // const searchParams = useSearchParams();
  // const searchQuery = searchParams.get('search') || ''; 

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendorProducts() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
           setError("No token found");
           setLoading(false);
           return;
        }

        const response = await axios.get('https://productservice.zeabur.app/api/products/vendor/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch products');
        setLoading(false);
      }
    }

    fetchVendorProducts();
  }, []);

  // Filter products whenever searchQuery (Passed from Parent) changes
  useEffect(() => {
    // If search is empty, show all
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  if (loading) return <ProductSkeleton />;
  if (error) return <div className="noproductsyet">{error}</div>;
  if (filteredProducts.length === 0)
    return <div className="noproductsyet">No products match your search.</div>;

  return (
    <div className="product-grid columns-4">
      {filteredProducts.map((product) => {
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
                {hasDiscount && <p className="discount">{discountPercent}% OFF</p>}
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
                  {hasDiscount && <p className="offer-price">${originalPrice.toFixed(2)}</p>}
                </div>

                <div className="rating">
                  <p>4.5</p>
                  <span><Star className='text-[grey]' /></span>
                  <p className="number">(100)</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Page;
