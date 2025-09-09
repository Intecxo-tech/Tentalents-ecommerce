'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Balance from '../../components/balance/Balance';
import Inventory from '../../components/inventory/Inventory';
import InventorySection from '../../components/InventorySection/InventorySection';
import Products from '../../components/noproducts/products';
import ProductHistory from '../../components/ProductHistory/ProductHistory';
import Ordercancel from '../../components/ordercancel/Ordercancel';
import '../../../app/(routes)/dashboard/store/store.css';

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

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
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
    <div className="p-[20px] background-[white] rounded-[10px]">
      <div className="store-header">
        <div className="storecomponents">
          <div className="earning">
            {/* ✅ Pass orders to Balance */}
            <Balance  />
          </div>
          <div className="noproducts">
            <Products count={productCount} />
          </div>
          <div className="fulfillment">
            <ProductHistory />
          </div>
          <div className="ordercancel">
            <Ordercancel />
          </div>
        </div>
      </div>

      <div className="productsection">{children}</div>
    </div>
  );
};

export default StoreLayout;
