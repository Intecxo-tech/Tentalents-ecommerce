'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const FullOrderPageSkeleton = () => {
  return (
    <div className="sidebar-overlay">
      <div className="sidebar-drawer">
        <div className="sidebar-content">
          <div style={{ padding: '20px' }}>
            <div className="orderpage">
              <div className="orderheadingpage">
                <h2><Skeleton width={180} height={24} /></h2>
                <Skeleton width={80} height={32} />
              </div>

              <div className="ordercomponent">
                <div className="ordercard">
                  <div className="orderpage-headerleft">
                    <Skeleton width={240} height={20} />
                    <Skeleton width={200} height={20} />
                  </div>

                  <div className="orderdetails">
                    <div className="shipto">
                      <Skeleton width={`100%`} height={40} />
                    </div>

                    <div className="payment-method">
                      <Skeleton width={120} height={20} />
                      <Skeleton width={100} height={20} />
                    </div>

                    <div className="paymentamount">
                      <Skeleton width={160} height={20} />
                      <div className="total">
                        <Skeleton width={180} height={20} />
                        <Skeleton width={80} height={20} />
                      </div>
                      <div className="total">
                        <Skeleton width={180} height={20} />
                        <Skeleton width={80} height={20} />
                      </div>
                      <div className="total">
                        <Skeleton width={180} height={20} />
                        <Skeleton width={80} height={20} />
                      </div>
                    </div>
                  </div>
                </div>

                <h1 className="yourorder"><Skeleton width={180} /></h1>

                <div className="orderlistitem">
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} className="image-wrapper2">
                      <div style={{ display: 'flex', gap: 16 }}>
                        <Skeleton width={80} height={80} />
                        <Skeleton width={220} height={24} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <Skeleton width={100} height={20} />
                        <Skeleton width={80} height={20} />
                        <Skeleton width={80} height={20} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tracking-section" style={{ marginTop: 24 }}>
                  <Skeleton height={24} width={240} />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ marginTop: 10 }}>
                      <Skeleton width={`80%`} height={18} />
                    </div>
                  ))}
                </div>

                <div className="laststep" style={{ marginTop: 24 }}>
                  <Skeleton width={140} height={36} />
                  <Skeleton width={220} height={36} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullOrderPageSkeleton;
