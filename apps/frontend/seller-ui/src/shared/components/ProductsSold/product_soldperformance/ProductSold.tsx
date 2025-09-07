'use client';
import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  sold: number;
}

interface ProductSoldProps {
  products: Product[];
  limit?: number;
}

const ProductSold: React.FC<ProductSoldProps> = ({ products, limit }) => {
  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <div>
      {displayedProducts.map((product) => (
        <div
          key={product.id}
          className="flex justify-between items-center py-2 rounded-[10px] background-[var(--lightblue2)] "
        >
          <div className="soldleft flex gap-[10px] items-center">
            <Image
            className='soldimages'
              src={product.image}
              alt={product.name}
              width={80}
              height={80}
            />
            <h3 className="product-title2 text-[15px]">{product.name}</h3>
          </div>

          <div className="rightside flex gap-[10px] items-center ">
            <p className="text-[var(--secondary)]">+{product.sold} <strong>Sold</strong></p>
            <ChevronRight className="text-black" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSold;
