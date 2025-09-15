'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AddressSkeleton = () => {
  return (
    <div className="addressmain">
      <div className="addressheader">
        <div className="address-header">
          <div className="address-headername">
            <h2><Skeleton width={150} height={20} /></h2>
          </div>
          <div className="addressbuttons">
            <button className="background-button" disabled>
              <Skeleton width={100} height={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="address-container">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="address-bar">
            <div className="address-card">
              <div className="addressleft">
                <Skeleton width={120} height={15} />
                <Skeleton width={250} height={40} />
              </div>
              <div className="addressright">
                <button className="bordered-button" disabled>
                  <Skeleton width={50} height={20} />
                </button>
                <button className="bordered-button" disabled>
                  <Skeleton width={50} height={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressSkeleton;
