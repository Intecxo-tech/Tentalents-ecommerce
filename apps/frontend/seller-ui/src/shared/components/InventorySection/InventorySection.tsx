import React, { useEffect, useState } from 'react';
import Dropdown from '../dropdown/Dropdownbutton';
import Inventory from './inventory/Inventory';
import Graph from '../../../assets/monitoring.png';
import Image from 'next/image';
import { Box } from 'lucide-react';

const statusOptions = ["Full Inventory", "Last Week", "Yesterday", "Last Month"];

interface Product {
  id: string;
  name: string;
  image: string;
  stock: number;
  createdAt?: string; // 👈 Needed for filtering
  inventory?: {
    variants?: {
      id: string;
      name: string;
      stock: number;
      status: string;
    }[];
  };
}

interface InventorySectionProps {
  products: Product[];
}

const InventorySection: React.FC<InventorySectionProps> = ({ products }) => {
  const [filter, setFilter] = useState("Full Inventory");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    if (filter === "Full Inventory") {
      setFilteredProducts(products);
      return;
    }

    const now = new Date();

    const filtered = products.filter(product => {
      if (!product.createdAt) return false;
      const createdAt = new Date(product.createdAt);

      if (filter === "Yesterday") {
        const y = new Date();
        y.setDate(now.getDate() - 1);

        return (
          createdAt.getDate() === y.getDate() &&
          createdAt.getMonth() === y.getMonth() &&
          createdAt.getFullYear() === y.getFullYear()
        );
      }

      if (filter === "Last Week") {
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
  }, [filter, products]);

  const isEmpty = filteredProducts.length === 0;

  return (
    <>
      <div className="inventoryheading flex align-center justify-between gap-[10px] mb-[10px]">
        <div className='flex justify-flex-start items-center gap-[10px]'>
          <Image src={Graph} alt='monitor' />
          <h2 className="mainheading">Inventory</h2>
        </div>
        <div className='flex justify-flex-end'>
          <Dropdown
            options={statusOptions}
            defaultValue="Full Inventory"
            onSelect={(value) => setFilter(value)}
          />
        </div>
      </div>

      {isEmpty ? (
        <div className="inventoryicon-empty">
          <Box className='emptybox' size={80} />
          <h2 className="text-[18px] text-[var(--grey)] font-medium">NA</h2>
        </div>
      ) : (
        <Inventory products={filteredProducts} limit={2} />
      )}
    </>
  );
};

export default InventorySection;
