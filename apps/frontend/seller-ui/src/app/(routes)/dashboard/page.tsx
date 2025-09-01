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
const page = () => {
    const [productCount, setProductCount] = useState<number>(0);
    const [orders, setOrders] = useState<VendorOrder[]>([]);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
  
      async function fetchVendorProducts() {
        try {
          const res = await axios.get(
            'https://product-service-23pc.onrender.com/api/products/vendor/products',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setProductCount(res.data.data.length);
        } catch (error) {
          console.error('Failed to fetch products.');
        }
      }
    async function fetchVendorOrders() {
      try {
        const res = await axios.get(
          'https://order-service-faxh.onrender.com/api/orders/vendor/orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(res.data.data);
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
    <Balance orders={orders} />
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

<InventorySection />
   
  </div>
</div>

     
    
    </div>
  )
}

export default page