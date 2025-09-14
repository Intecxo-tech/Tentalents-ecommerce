'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductCardSkeleton = () => {
  return (
    <div className='productrcard flex flex-col gap-[10px] p-[15px] rounded-[10px] bg-[#ffffff]'>
      
      {/* Header Skeleton */}
      <div className="productheading flex justify-flex-start items-center gap-[10px]">
        <Skeleton circle height={24} width={24} />
        <Skeleton height={20} width={120} />
      </div>

      {/* Middle Number */}
      <div className="middleproduct">
        <Skeleton height={32} width={60} />
      </div>

      {/* Bottom bar */}
      <div className="flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#E2FFD9]">
        <Skeleton circle height={20} width={20} />
        <Skeleton height={20} width={100} />
      </div>
      
    </div>
  );
};

export default ProductCardSkeleton;
