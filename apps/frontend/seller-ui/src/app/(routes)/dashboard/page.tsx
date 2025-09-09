'use client';
import HeaderBanner from '../../../shared/components/header/headerbanner'

import HomeProducts from '../../../shared/components/ProductsSold/HomeProducts';
import React, { useEffect, useState } from 'react'
import ProductSold from '../../../shared/components/ProductsSold/product_soldperformance/ProductSold';
import ProductTabs from '../../../shared/components/ProductTabs/ProductTabs'
import InventorySection from '../../../shared/components/InventorySection/InventorySection';
import Balance from '../../../shared/components/balance/Balance';
import ProductHistory from '../../../shared/components/ProductHistory/ProductHistory';
import './page.css'
import axios from 'axios';
import BalanceSkeleton from '../../../shared/components/balance/BalanceSkeleton';

interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
  
  order?: {
    id: string;
    status: string;
    createdAt?: string;
  };
}
interface Listing {
  id: string;
  variantName?: string | null;
  stock?: number | null;
}
const page = () => {
 const [products, setProducts] = useState<any[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [fulfilledPercentage, setFulfilledPercentage] = useState<number>(0);
  const [recentMessage, setRecentMessage] = useState<string>("");
const [balanceLoading, setBalanceLoading] = useState(true);
 useEffect(() => {
    const token = localStorage.getItem('token');

    async function fetchVendorProducts() {
      try {
        const res = await axios.get(
          'https://product-service-i82l.onrender.com/api/products/vendor/products',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProductCount(res.data.data.length);
        const rawProducts = res.data.data;

        const mappedProducts = rawProducts.map((product: any) => {
          const listings: Listing[] = product.listings || [];

          const hasVariants = listings.some(
            (listing: Listing) =>
              listing.variantName && listing.variantName.trim() !== ''
          );

          if (hasVariants) {
            return {
              id: product.id,
              name: product.title,
              image: product.imageUrls?.[0] || '',
              stock: 0,
              inventory: {
                variants: listings.map((listing: Listing, index: number) => ({
                  id: listing.id || `variant-${index}`,
                  name: listing.variantName?.trim() || `Variant ${index + 1}`,
                  stock: listing.stock ?? 0,
                  status:
                    listing.stock && listing.stock > 10
                      ? 'avail'
                      : listing.stock && listing.stock > 0
                      ? 'restock'
                      : 'empty',
                })),
              },
            };
          } else {
            const totalStock = listings.reduce(
              (acc: number, listing: Listing) => acc + (listing.stock ?? 0),
              0
            );
            return {
              id: product.id,
              name: product.title,
              image: product.imageUrls?.[0] || '',
              stock: totalStock,
              inventory: {
                variants: [],
              },
            };
          }
        });

        setProducts(mappedProducts);
      } catch (error) {
        console.error('❌ Failed to fetch products.', error);
      }
    }


    async function fetchVendorOrders() {
      try {
        const res = await axios.get(
          'https://order-service-322f.onrender.com/api/orders/vendor/orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const fetchedOrders = res.data.data;
        setOrders(fetchedOrders);

        // Calculate fulfilled orders
     const fulfilled = fetchedOrders.filter((order: VendorOrder) => order.order?.status === 'delivered');

        const percentage = fetchedOrders.length > 0
          ? Math.round((fulfilled.length / fetchedOrders.length) * 100)
          : 0;

        setFulfilledPercentage(percentage);

        const recentCount = Math.min(10, fulfilled.length);
        setRecentMessage(`Recent ${recentCount} order${recentCount !== 1 ? 's' : ''} were fulfilled`);

      } catch (err) {
        console.error('Failed to fetch orders.');
      }
    }

    fetchVendorProducts();
    fetchVendorOrders();
  }, []);
  

  return (
    <div className='background-[var(--lightblue2)] p-[10px] rounded-[10px] main-pagesettings' >
     

   <div className="topsection flex justify-between gap-[10px] background-[white] p-[10px] rounded-[10px] mb-[15px]">
  <div className=" producthistorts w-1/3">
    <Balance  />
  </div>
  <div className=" producthistorts w-1/3">
    <HomeProducts />
  </div>
  <div className=" producthistorts w-1/3">
    <ProductHistory />
  </div>
</div>

     <div className='inventory-sectionback'>
  <div className="prodiucttabdsw">
    <ProductTabs />
  </div>
  <div className="inventory-sectionw">

<InventorySection products={products} />
   
  </div>
</div>

     
    
    </div>
  )
}

export default page