// components/ProductListItem/ProductSkeletonItem.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductSkeletonItem = () => {
  return (
    <div className="product-list-item">
      <div className="image-wrapper2">
        <Skeleton height="100%" width="100%" style={{ borderRadius: '8px' }} />
      </div>
      <div className="content-area2">
        <h3 className="product-title">
          <Skeleton width="80%" />
        </h3>
        <div className="price-main">
          <div className="price-section">
            <Skeleton width={60} />
          </div>
          <div className="rating">
            <Skeleton width={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeletonItem;
