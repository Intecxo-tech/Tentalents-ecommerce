'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../../orders/orders.css'; // Your custom styles (optional)

const OrderPlacedSkeleton: React.FC = () => {
  return (
    <div className="main-containerproduct">
      <div className="product-list-item2">
        <div className="image-wrapper2">
          <Skeleton height={100} width={100} />
        </div>
        <div className="content-area2">
          <h3 className="product-title">
            <Skeleton width={`60%`} height={20} />
          </h3>

          <div className="price-main">
            <div className="price-section">
              <Skeleton width={60} height={16} style={{ marginBottom: '6px' }} />
              <Skeleton width={50} height={16} />
            </div>
            <div className="quantity-sec">
              <Skeleton width={100} height={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPlacedSkeleton;
