'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './vendor.css';

const VendorSkeleton = () => {
  return (
    <div className="vendor-grid">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="vendorcard">
          <div className="cardstyles">
            <div className="vendordeatil">
              <div className="vendorleft">
                <Skeleton circle width={100} height={100} />
              </div>

              <div className="vendorright">
                <div className="vendorname">
                  <Skeleton width={120} />
                  <div className="stars">
                    <Skeleton width={30} />
                    <Skeleton width={40} />
                  </div>
                </div>

                <p className="productslist">
                  <Skeleton width={80} />
                </p>

                <div className="catrgoies">
                  <Skeleton width={100} height={20} />
                  <Skeleton width={120} height={20} />
                </div>
              </div>
            </div>

            <div className="vendorbottom">
              <p>
                <Skeleton width={200} />
              </p>

              <div className="first-column">
                <p><Skeleton width={120} /></p>
                <p><Skeleton width={180} /></p>
              </div>

              <div className="first-column">
                <p><Skeleton width={150} /></p>
                <p><Skeleton width={150} /></p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorSkeleton;
