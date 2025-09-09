// components/skeletons/ProductSkeleton.tsx
'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductSkeleton: React.FC = () => {
  const skeletonCards = Array(8).fill(null); // Adjust number of skeleton cards as needed

  return (
    <div className="product-grid columns-4 gap-4">
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className="product-card bg-white  rounded-lg shadow-sm"
        >
          {/* Image skeleton */}
          <div className="image-wrapper relative h-[180px] w-full overflow-hidden rounded-t-lg">
            <Skeleton height="100%" width="100%" />
          </div>

          <div className="p-4 space-y-3">
            {/* Title */}
            <Skeleton height={20} width="75%" />

            {/* Price and Rating */}
            <div className="flex justify-between items-center">
              {/* Price */}
              <Skeleton height={16} width="30%" />

              {/* Rating */}
              <div className="flex items-center gap-1">
                <Skeleton circle height={16} width={16} />
                <Skeleton height={16} width={24} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
