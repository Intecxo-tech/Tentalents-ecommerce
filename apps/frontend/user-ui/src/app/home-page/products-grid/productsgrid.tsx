// Products.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../../components/productcard/productcard';
import type { ProductItem } from '../../components/productcard/productcard';
import { getAllProducts } from '../../../services/productService';
import './productgrid.css';
import ProductCardSkeleton from '../../components/productcard/ProductCardSkeleton';
type ProductsProps = {
  columns?: number;
  category?: string;
  showHeader?: boolean;
   products?: ProductItem[];
};

const Products = ({ columns = 5, category, showHeader = true, products: propProducts  }: ProductsProps) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      setLoading(false);
      setError(null);
    } else {
      async function fetchProducts() {
        try {
          const rawProducts = await getAllProducts();
         const mappedProducts = rawProducts.map((p: any) => {
  const listing = p.listings?.[0];
  const vendor = listing?.vendor?.user
    ? {
        id: listing.vendor.id,
        name: listing.vendor.businessName || listing.vendor.user?.name || 'Unnamed Vendor',
        image: listing.vendor.profileImage || listing.vendor.user?.profileImage ,
        productCount: listing.vendor.productListings?.length || 0,
      }
    : {
       
      };

  return {
    id: p.id,
    title: p.title,
    price: listing ? Number(listing.originalPrice) : 0,
    offerPrice: listing ? Number(listing.price) : undefined,
    image: p.imageUrls?.[0] || '',
    rating: p.ratings?.length > 0 ? p.ratings[0].score : 0,
    href: `/shop/${p.slug}`,
    category: p.category,
    vendor,  // <-- pass full vendor object here
  };
});

          setProducts(mappedProducts);
        } catch (err) {
          setError('Failed to load products');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      fetchProducts();
    }
  }, [propProducts]);

  const getDiscount = (price: number, offerPrice?: number): number => {
    if (price <= 0 || !offerPrice || offerPrice >= price) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
  };

  // Filter products by category if provided
  const filteredProducts = category
    ? products.filter((item) =>
        Array.isArray(item.category)
          ? item.category.includes(category)
          : item.category === category
      )
    : products;




   if (loading || error) {
    return (
      <div className="products-grid">
        {showHeader && (
          <div className="main-heading">
            <h3 className="heading">Popular Products</h3>
            <button className="background-button">
              Explore <ChevronRight />
            </button>
          </div>
        )}

        <div className={`product-grid columns-${columns}`}>
          {Array.from({ length: columns }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ✅ Return actual product cards after loading is done
  return (
    <div className="products-grid">
      {showHeader && (
        <div className="main-heading">
          <h3 className="heading">Popular Products</h3>
          <button className="background-button">
            Explore <ChevronRight />
          </button>
        </div>
      )}

      <div className={`product-grid columns-${columns}`}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} getDiscount={getDiscount} />
        ))}
      </div>
    </div>
  );


};

export default Products;
