'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const OrdercancelSkeleton: React.FC = () => {
  return (
    <div className="productrcard flex flex-col gap-[10px] p-[15px] rounded-[10px] bg-[#ffffff]">
      {/* Header Section */}
      <div className="productheading flex justify-flex-start items-center gap-[10px]">
        <Skeleton circle width={24} height={24} />
        <Skeleton width={150} height={20} />
      </div>

      {/* Percentage Display */}
      <div className="percentage">
        <Skeleton width={60} height={40} />
      </div>

      {/* Canceled Products Box */}
      <div className="flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#E2FFD9]">
        <Skeleton circle width={24} height={24} />
        <Skeleton width={180} height={20} />
      </div>
    </div>
  );
};

export default OrdercancelSkeleton;
