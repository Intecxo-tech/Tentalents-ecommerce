// components/skeletons/BalanceSkeleton.tsx
'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BalanceSkeleton: React.FC = () => {
  return (
    <div className="Balance p-[15px] rounded-[10px] flex flex-col gap-[10px] flex-1">
      {/* Header with icon and dropdown */}
      <div className="balanceheading flex justify-between items-center">
        <div className="flex gap-[10px] items-center">
          <Skeleton circle width={30} height={30} />
          <Skeleton width={100} height={20} />
        </div>
        <Skeleton width={100} height={35} />
      </div>

      {/* Balance amount */}
      <div className="balanceamount text-[32px] text-[var(--secondary)]">
        <Skeleton width={120} height={30} />
      </div>

      {/* Recents section */}
      <div className="totalbalance bg-[#EBEBEB] flex justify-between items-center p-[10px] rounded-[10px]">
        <Skeleton width={60} height={20} />
        <Skeleton width={60} height={20} />
      </div>
    </div>
  );
};

export default BalanceSkeleton;
