'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductSoldSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className="flex flex-col gap-[10px]">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-2 px-2 rounded-[10px] background-[var(--lightblue2)]"
        >
          {/* Left: Image + Title Skeleton */}
          <div className="soldleft flex gap-[10px] items-center">
            <Skeleton width={80} height={40} borderRadius={8} />
            <Skeleton width={100} height={20} />
          </div>

          {/* Right: Sold count + chevron icon */}
          <div className="rightside flex gap-[10px] items-center">
            <Skeleton width={60} height={20} />
            <Skeleton width={16} height={16} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSoldSkeleton;
