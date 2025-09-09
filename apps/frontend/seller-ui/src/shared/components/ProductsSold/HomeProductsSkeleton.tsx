// components/skeletons/HomeProductsSkeleton.tsx
'use client';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Image from 'next/image';
import Graph from '../../../assets/monitoring.png';

const HomeProductsSkeleton: React.FC = () => {
  return (
    <div className="productsoldmain p-[15px] rounded-[10px] background-white">
      <div className="productsoldheading">
        <div className="inventoryheading flex align-center justify-between gap-[10px] mb-[10px]">
          <div className="flex justify-flex-start items-center gap-[10px]">
            <Image src={Graph} alt="monitor" />
            <Skeleton width={100} height={24} />
          </div>
          <div className="flex justify-flex-end">
            <Skeleton width={100} height={32} />
          </div>
        </div>
      </div>

      <div className="productsoldvalues flex flex-col gap-[10px]">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 px-2 rounded-[10px] background-[var(--lightblue2)]"
          >
            <div className="soldleft flex gap-[10px] items-center">
              <Skeleton width={80} height={80} borderRadius={8} />
              <Skeleton width={100} height={20} />
            </div>

            <div className="rightside flex gap-[10px] items-center">
              <Skeleton width={60} height={20} />
              <Skeleton width={16} height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeProductsSkeleton;
