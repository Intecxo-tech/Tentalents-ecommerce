// Productslist.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ProductListItem from '../../components/productitemlist/Productitemlist';
import { getAllProducts } from '../../../services/productService';
import './productlist.css';
import type { StaticImageData } from 'next/image';
import ProductSkeletonItem from '../../components/productitemlist/ProductSkeletonItem';

export type ProductItem = {
  id: string;
  title: string;
  price: number;
  offerPrice?: number;
  reviewCount: number; 
  image: (string | StaticImageData)[];  
  rating: number;
  href: string;
  category: string[];
};

type ProductsProps = {
  listCount?: number;
};

const Productslist = ({ listCount = 2 }: ProductsProps) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const rawProducts = await getAllProducts();

        const mappedProducts: ProductItem[] = rawProducts.map((p: any) => {
          const listing = p.listings?.[0];

          return {
            id: p.id,
            title: p.title,
            price: listing ? Number(listing.originalPrice) : 0,
            offerPrice: listing ? Number(listing.price) : undefined,
            image: p.imageUrls || [],  
            rating: p.ratings?.length > 0 ? p.ratings[0].score : 0,
            href: `/shop/${p.slug}`,
             category: Array.isArray(p.category) ? p.category : [p.category],
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const discountedItems = products
    .filter((item) => item.offerPrice !== undefined && item.offerPrice < item.price)
    .slice(0, listCount);

  return (
    <div className="products-lists">
      <div className="main-heading">
        <h3 className="heading">Heavy Discount</h3>
      </div>

      <div className="product-list">
       {loading || error ? (
  <>
    {Array.from({ length: listCount }).map((_, i) => (
      <ProductSkeletonItem key={i} />
    ))}
  </>
) : discountedItems.length === 0 ? (
  <p>No discounted products found.</p>
) : (
  discountedItems.map((product, index) => (
    <div key={index}>
      <ProductListItem product={product} />
    </div>
  ))
)}

      </div>
    </div>
  );
};

export default Productslist;
