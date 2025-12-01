'use client';

import React, { useEffect, useState } from 'react';
import ProductSold from './product_soldperformance/ProductSold';
import Graph from '../../../assets/monitoring.png';
import Image from 'next/image';
import axios from 'axios';
import Dropdown from '../dropdown/Dropdownbutton';
import ProductSoldSkeleton from '../ProductsSold/product_soldperformance/ProductSoldSkeleton';

const statusOptions = ["Full Inventory", "Past Week", "Yesterday", "Last Month"]; // 👈 Added "All"

interface Product {
  id: string;
  name: string;
  image: string;
  sold: number;
  createdAt?: string;
}

interface HomeProductsProps {
  vendorId?: string;
}

const HomeProducts: React.FC<HomeProductsProps> = ({ vendorId }) => {
  const [productsSold, setProductsSold] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState("Full Inventory"); // 👈 Default ALL

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userRole: string | null = null;

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        userRole = decoded.role || null;
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }

    async function fetchData() {
      try {
        let products: any[] = [];
        let orders: any[] = [];

        if (userRole === 'admin' && vendorId) {
          const adminRes = await axios.get('https://adminservice.zeabur.app/api/admin/sellers/all-with-products', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const vendors = adminRes.data.data || [];
          const targetVendor = vendors.find((v: any) => String(v.id) === String(vendorId));
          if (!targetVendor) throw new Error('Vendor not found');

          products =
            targetVendor.productListings?.map((listing: any) => ({
              id: listing.product?.id || listing.id,
              name: listing.product?.title || 'Unknown Product',
              image: listing.product?.imageUrls?.[0] || '',
            })) || [];

          orders = targetVendor.orderItems || [];

        } else {
          const productRes = await axios.get('https://productservice.zeabur.app/api/products/vendor/products', {
            headers: { Authorization: `Bearer ${token}` },
          });
          products = productRes.data.data || [];

          const ordersRes = await axios.get('https://orderservice.zeabur.app/api/orders/vendor/orders', {
            headers: { Authorization: `Bearer ${token}` },
          });
          orders = ordersRes.data.data || [];
        }

        const productSoldData: Product[] = products.map((product: any) => {
          const filteredOrders = orders.filter((order: any) => order.productId === product.id);

          const soldCount = filteredOrders.reduce(
            (acc: number, order: any) => acc + order.quantity,
            0
          );

          return {
            id: product.id,
            name: product.name || product.title || 'Unknown Product',
            image: product.image || product.imageUrls?.[0] || '',
            sold: soldCount,
            createdAt: filteredOrders[0]?.createdAt || null, // 👈 Used for filtering
          };
        });

        setProductsSold(productSoldData);
        setFilteredProducts(productSoldData); // 👈 Default: ALL

      } catch (error) {
        console.error('Failed to fetch products or orders', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [vendorId]);

  // --- FILTER FUNCTION ---
  useEffect(() => {
    if (filter === "Full Inventory") {
      setFilteredProducts(productsSold);
      return;
    }

    const now = new Date();

    const filtered = productsSold.filter(product => {
      if (!product.createdAt) return false;
      const createdAt = new Date(product.createdAt);

      if (filter === "Yesterday") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        return (
          createdAt.getDate() === yesterday.getDate() &&
          createdAt.getMonth() === yesterday.getMonth() &&
          createdAt.getFullYear() === yesterday.getFullYear()
        );
      }

      if (filter === "Past Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return createdAt >= weekAgo && createdAt <= now;
      }

      if (filter === "Last Month") {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = lastMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();

        return (
          createdAt.getMonth() === lastMonth &&
          createdAt.getFullYear() === year
        );
      }

      return true;
    });

    setFilteredProducts(filtered);
  }, [filter, productsSold]);

  return (
    <div className="productsoldmain p-[15px] rounded-[10px] background-white">
      <div className="productsoldheading">
        <div className="inventoryheading flex align-center justify-between gap-[10px] mb-[10px]">
          <div className='flex justify-flex-start items-center gap-[10px]'>
            <Image src={Graph} alt='monitor' />
            <h2 className="mainheading">Inventory</h2>
          </div>
          <div className='flex justify-flex-end'>
            <Dropdown
              options={statusOptions}
              defaultValue="Full Inventory" // 👈 Default ALL
              onSelect={(value) => setFilter(value)} // 👈 Filter applied
            />
          </div>
        </div>
      </div>

      <div className="productsoldvalues">
        {loading ? (
          <ProductSoldSkeleton count={2} />
        ) : filteredProducts.length === 0 ? (
          <div className="inventory-empty text-center p-[20px] bg-white rounded-[10px]">
            <h2 className="text-[18px] text-[var(--grey)] font-medium">NA</h2>
          </div>
        ) : (
          <ProductSold limit={2} products={filteredProducts} /> // 👈 Shows filtered products
        )}
      </div>
    </div>
  )
}

export default HomeProducts;
