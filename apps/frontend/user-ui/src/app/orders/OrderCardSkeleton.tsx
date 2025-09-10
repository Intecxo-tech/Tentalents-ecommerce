'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './orders.css'; // reuse existing styles if necessary

const OrderSectionSkeleton: React.FC = () => {
  return (
    <div className="orderapagefull2">
      <div className="orderapagefull">
        <div className="orderpageleft-2">
          <div className="yourorder-header">
            <h2 className="sectiontitle">
              <Skeleton width={120} height={28} />
            </h2>

            <div className="dateorder">
              <div className="search-inputbutton">
                <Skeleton height={40} width={200} style={{ marginRight: '10px' }} />
                <Skeleton circle height={40} width={40} />
              </div>

              <Skeleton height={40} width={180} />
            </div>
          </div>

          <div className="sectionorder">
            {[1, 2].map((_, idx) => (
              <div key={idx} className="sectionsorder">
                <div className="ordercard-skeleton">
                  <Skeleton height={30} width={200} style={{ marginBottom: 10 }} />
                  <Skeleton height={20} width={120} />
                  <Skeleton height={20} width={100} />
                  <Skeleton height={20} width={160} />
                </div>

                <div className="yourorder-skeleton">
                  {[1, 2].map(i => (
                    <div key={i} className="orderlistitem" style={{ cursor: 'default' }}>
                      <div className="orderimage">
                        <Skeleton width={100} height={100} />
                        <div className="ordercontentleft">
                          <Skeleton width={150} height={20} />
                        </div>
                      </div>

                      <div className="flexcontainer">
                        <Skeleton width={80} height={20} />
                        <Skeleton width={50} height={20} />
                        <Skeleton width={60} height={20} />
                      </div>
                    </div>
                  ))}

                  <div className="review-button-container">
                    <Skeleton width={180} height={35} />
                    <Skeleton width={160} height={35} style={{ marginTop: 10 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="productpageright">
          <div className="popularproductcard">
            <h2 className="sectiontitle">
              <Skeleton width={160} height={28} />
            </h2>
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} style={{ marginBottom: 15 }}>
                <Skeleton height={100} />
              </div>
            ))}
            <Skeleton width={140} height={40} />
          </div>

          <div className="fullwidth-banner">
            <Skeleton height={180} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSectionSkeleton;
