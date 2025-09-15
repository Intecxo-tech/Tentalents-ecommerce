'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './productaccept.css'; // If you want to reuse layout styles

const ProductAcceptSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="productsection">
      {Array(count).fill(0).map((_, i) => (
        <div className="product-item" key={i}>
          <div className="product-section">
            <Skeleton width={100} height={100} borderRadius={8} />
            <div style={{ marginLeft: '1rem', flex: 1 }}>
              <Skeleton height={20} width={'80%'} />
              <Skeleton height={16} width={'60%'} style={{ marginTop: '0.5rem' }} />
            </div>
          </div>
          <div className="produtdetails">
            <Skeleton width={60} height={20} />
            <Skeleton width={60} height={20} />
            <Skeleton width={80} height={20} />
            <div className="status-tags" style={{ display: 'flex', gap: '0.5rem' }}>
              <Skeleton width={50} height={20} />
              <Skeleton width={50} height={20} />
            </div>
          </div>
          <div className="productstatus">
            <Skeleton width={'100%'} height={36} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductAcceptSkeleton;
