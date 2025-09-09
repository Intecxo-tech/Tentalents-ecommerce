import React from 'react';
import Dropdown from '../dropdown/Dropdownbutton';
import Inventory from './inventory/Inventory';
import Graph from '../../../assets/monitoring.png';
import Image from 'next/image';
import { Box } from 'lucide-react';
const statusOptions = ["Last Week", "Yesterday", "Last Month"];

interface Product {
  id: string;
  name: string;
  image: string;
  stock: number;
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
  const isEmpty = products.length === 0;
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
            defaultValue="Last Week"
            onSelect={(value) => {
              console.log("Selected status:", value);
            }}
          />
        </div>
      </div>
       {isEmpty ? (
        <div className="inventoryicon-empty ">
         <Box className='emptybox' size={80} />
          <h2 className="text-[18px] text-[var(--grey)] font-medium">NA</h2>
        </div>
      ) : (
        <Inventory products={products} limit={2} />
      )}
    </>
  );
};

export default InventorySection;
