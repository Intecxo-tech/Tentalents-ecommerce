'use client';

import React, { useEffect, useState } from 'react';
import ProductSold from './product_soldperformance/ProductSold';
import Graph from '../../../assets/monitoring.png';
import Image from 'next/image';
import axios from 'axios';
import Dropdown from '../dropdown/Dropdownbutton';
import ProductSoldSkeleton from '../ProductsSold/product_soldperformance/ProductSoldSkeleton';

const statusOptions = ["Past Week", "Yesterday", "Last Month"];

interface Product {
  id: string;
  name: string;
  image: string;
  sold: number;
}

interface HomeProductsProps {
  vendorId?: string; // Optional, for admin view
}

const HomeProducts: React.FC<HomeProductsProps> = ({ vendorId }) => {
  const [productsSold, setProductsSold] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userRole: string | null = null;

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Simple jwt decode
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
          // --- Admin flow: fetch products for specific vendor ---
          const adminRes = await axios.get('https://adminservice.zeabur.app/api/admin/sellers/all-with-products', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const vendors = adminRes.data.data || [];
          const targetVendor = vendors.find((v: any) => String(v.id) === String(vendorId));

          if (!targetVendor) throw new Error('Vendor not found');

          // Products for this vendor
          products = targetVendor.productListings?.map((listing: any) => ({
            id: listing.product?.id || listing.id,
            name: listing.product?.title || 'Unknown Product',
            image: listing.product?.imageUrls?.[0] || '',
          })) || [];

          // Orders for this vendor
          orders = targetVendor.orderItems || [];

        } else {
          // --- Vendor or non-admin flow: fetch own products & orders ---
          const productRes = await axios.get('https://productservice.zeabur.app/api/products/vendor/products', {
            headers: { Authorization: `Bearer ${token}` },
          });
          products = productRes.data.data || [];

          const ordersRes = await axios.get('https://orderservice.zeabur.app/api/orders/vendor/orders', {
            headers: { Authorization: `Bearer ${token}` },
          });
          orders = ordersRes.data.data || [];
        }

        // Map products and calculate sold count per product
        const productSoldData: Product[] = products.map((product: any) => {
          const soldCount = orders
            .filter((order: any) => order.productId === product.id)
            .reduce((acc: number, order: any) => acc + order.quantity, 0);

          return {
            id: product.id,
            name: product.name || product.title || 'Unknown Product',
            image: product.image || product.imageUrls?.[0] || '',
            sold: soldCount,
          };
        });

        setProductsSold(productSoldData);

      } catch (error) {
        console.error('Failed to fetch products or orders', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [vendorId]);

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
              defaultValue="Past Week"
              onSelect={(value) => console.log("Selected status:", value)}
            />
          </div>
        </div>
      </div>
      <div className="productsoldvalues">
        {loading ? (
          <ProductSoldSkeleton count={2} />
        ) : productsSold.length === 0 ? (
          <div className="inventory-empty text-center p-[20px] bg-white rounded-[10px]">
            <h2 className="text-[18px] text-[var(--grey)] font-medium">NA</h2>
          </div>
        ) : (
          <ProductSold limit={2} products={productsSold} />
        )}
      </div>
    </div>
  )
}

export default HomeProducts;

