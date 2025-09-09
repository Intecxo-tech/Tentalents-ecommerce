// components/ProductHistory/ProductHistorySkeleton.tsx
'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductHistorySkeleton: React.FC = () => {
  return (
    <div className="productHistory p-[15px] rounded-[10px] bg-white flex flex-col gap-[10px] flex-1">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[10px]">
          <Skeleton width={30} height={30} />
          <Skeleton width={120} height={20} />
        </div>
        <Skeleton width={100} height={30} />
      </div>

      {/* Percentage skeleton */}
      <div>
        <Skeleton width={80} height={40} />
      </div>

      {/* Recent message skeleton */}
      <div className="flex items-center gap-[10px] bg-[#EBEBEB] p-[10px] rounded-[10px]">
        <Skeleton circle width={24} height={24} />
        <Skeleton width={200} height={20} />
      </div>
    </div>
  );
};

export default ProductHistorySkeleton;
