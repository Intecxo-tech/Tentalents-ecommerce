import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './yourorder.css'; // Reuse your styles

const YourOrderSkeleton: React.FC = () => {
  return (
    <div className="products-lists productlistaddtocart2">
      <h2 className="yourorder">
        <Skeleton width={150} height={25} />
      </h2>
      <div className="product-list">
        {[1, 2, 3].map(i => (
          <div key={i} className="orderlistitem" style={{ cursor: 'default' }}>
            <div className="orderimage">
              <div
                className="image-wrapper2"
                style={{ position: 'relative', width: '100px', height: '100px' }}
              >
                <Skeleton height={100} width={100} />
              </div>
              <div className="ordercontentleft">
                <Skeleton width={160} height={20} />
              </div>
            </div>

            <div className="flexcontainer">
              <div className="rating-stars staras">
                <Skeleton width={100} height={20} />
              </div>
              <div className="quantity price-section">
                <Skeleton width={60} height={20} />
              </div>
              <div className="quantity-sec orderquantitypage">
                <Skeleton width={60} height={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="review-button-container">
        <Skeleton width={180} height={35} />
        <div className="return-refund-button-container" style={{ marginTop: '10px' }}>
          <Skeleton width={150} height={35} />
        </div>
      </div>
    </div>
  );
};

export default YourOrderSkeleton;
