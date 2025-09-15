'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../order/order.css'; // Reuse your existing styles

const OrderSkeleton = () => {
  return (
    <div className="orderspage">
      <div className="ordersheading">
        <div className="leftsideorder">
          <h1><Skeleton width={120} height={30} /></h1>
        </div>
        <div className="rightsideorder">
          <div className="search-container">
            <div className="searchbar">
              <Skeleton height={40} width={200} />
              <Skeleton height={40} width={40} style={{ marginLeft: '10px' }} />
            </div>
          </div>
          <Skeleton height={40} width={140} style={{ marginLeft: '10px' }} />
          <Skeleton height={40} width={140} style={{ marginLeft: '10px' }} />
        </div>
      </div>

      <div className="productsection">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="product-item">
            <div className="product-section">
              <Skeleton width={100} height={100} />
              <Skeleton width={180} height={20} style={{ marginTop: '10px' }} />
            </div>
            <div className="produtdetails">
              <Skeleton width={50} height={20} />
              <Skeleton width={80} height={20} />
              <Skeleton width={100} height={20} />
              <div className="status-tags">
                <Skeleton width={60} height={20} style={{ marginRight: '5px' }} />
                <Skeleton width={60} height={20} />
              </div>
            </div>
            <div className="productstatus">
              <Skeleton width={100} height={35} style={{ marginBottom: '8px' }} />
              <Skeleton width={100} height={35} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSkeleton;
