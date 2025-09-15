// components/orderform/OrderFormSkeleton.tsx
'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const OrderFormSkeleton = () => {
  return (
    <div className="sidebar-overlay">
      <div className="sidebar-drawer">
        <div className="sidebar-content" style={{ padding: 20 }}>
          <div className="orderpage">
            <div className="orderheadingpage">
              <h2><Skeleton width={180} height={24} /></h2>
              <Skeleton width={80} height={32} />
            </div>

            <div className="ordercard">
              <div className="orderpage-headerleft">
                <Skeleton width={240} height={20} />
                <Skeleton width={200} height={20} />
                <Skeleton width={180} height={20} />
              </div>

              <div className="orderdetails">
                <Skeleton width={`100%`} height={80} style={{ marginBottom: 16 }} />

                <div className="payment-method">
                  <Skeleton width={140} height={20} />
                  <Skeleton width={100} height={20} />
                </div>

                <div className="paymentamount">
                  <Skeleton width={160} height={20} />
                  <Skeleton width={220} height={20} />
                  <Skeleton width={220} height={20} />
                  <Skeleton width={220} height={20} />
                </div>
              </div>
            </div>

            <div className="ordercards">
              <h1 className="ordertitle"><Skeleton width={250} /></h1>
              <div className="buyercard">
                <Skeleton circle width={50} height={50} />
                <Skeleton width={140} height={20} />
              </div>

              <h1 className="ordertitle"><Skeleton width={250} /></h1>
              <div className="buyercard">
                {[...Array(2)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <Skeleton width={50} height={50} />
                    <div>
                      <Skeleton width={140} height={20} />
                      <Skeleton width={100} height={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h1 className="yourorder"><Skeleton width={180} /></h1>
            <div className="orderlistitem">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="image-wrapper2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Skeleton width={80} height={80} />
                    <Skeleton width={200} height={24} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Skeleton width={100} height={20} />
                    <Skeleton width={80} height={20} />
                    <Skeleton width={80} height={20} />
                  </div>
                </div>
              ))}
            </div>

            <div className="laststep" style={{ marginTop: 20 }}>
              <Skeleton width={120} height={36} />
              <Skeleton width={180} height={36} />
              <Skeleton width={180} height={36} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFormSkeleton;
