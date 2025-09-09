import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-card">
      <div className="image-wrapper">
        <Skeleton height={260} width="100%" borderRadius={8} />
      </div>

      <h3 className="product-title">
        <Skeleton width="80%" />
      </h3>

      <div className="price-main">
        <div className="price-section">
          <Skeleton width={50} height={20} />
          <Skeleton width={40} height={20} style={{ marginLeft: 10 }} />
        </div>
        <div className="rating">
          <Skeleton width={30} height={20} />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
