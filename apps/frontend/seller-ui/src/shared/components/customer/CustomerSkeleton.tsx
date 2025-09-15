'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../vendors/vendor.css'; // Assuming your styles are similar to the original

const CustomerSkeleton = () => {
  return (
    <div className="vendor-grid">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="vendorcard">
          <div className="cardstyles">
            <div className="vendordeatil">
              <div className="vendorleft">
                <Skeleton circle width={96} height={96} />
              </div>
              <div className="vendorright vendorright2">
                <div className="vendorname">
                  <Skeleton width={120} />
                  <div className="stars">
                    <Skeleton width={30} />
                    <Skeleton width={40} />
                  </div>
                </div>

                <div className="catrgoies">
                  <Skeleton width={150} height={20} />
                  <Skeleton width={150} height={20} />
                  <Skeleton width={180} height={20} />
                </div>
              </div>
            </div>

            <div className="vendorbottom">
              <p>
                <Skeleton width={200} />
              </p>
              <div className="first-column">
                <Skeleton width={120} />
                <Skeleton width={180} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerSkeleton;
