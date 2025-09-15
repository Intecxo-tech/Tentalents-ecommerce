// components/skeletons/AccountPageSkeleton.tsx
'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AccountPageSkeleton = () => {
  return (
    <div className="main-pagesetting">
      <div className="account-page">
        {/* Header */}
        <div className="headertop">
          <div className="headingarea">
            <Skeleton height={30} width={150} />
            <Skeleton height={20} width={120} />
          </div>
          <div className="headerright">
            <Skeleton height={36} width={100} />
          </div>
        </div>

        <div className="accountpage-section">
          {/* Left Section */}
          <div className="section1">
            <div className="bankheading">
              <Skeleton height={25} width={200} />
              <Skeleton height={36} width={140} />
            </div>

            <div className="personaldetails">
              <div className="personal-left">
                <Skeleton circle height={90} width={90} />
              </div>
              <div className="personal-right">
                <div className="first-column">
                  <Skeleton height={40} width="100%" />
                  <Skeleton height={40} width="100%" />
                </div>
                <div className="first-column">
                  <Skeleton height={40} width="100%" />
                  <Skeleton height={40} width="100%" />
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="kycdocs">
            <div className="bankheading">
              <Skeleton height={25} width={200} />
              <Skeleton height={36} width={140} />
            </div>

            <div className="first-column">
              <Skeleton height={40} width="100%" />
              <Skeleton height={40} width="100%" />
            </div>

            <div className="first-column top-column">
              <Skeleton height={40} width="100%" />
              <Skeleton height={40} width="100%" />
            </div>

            <div className="first-column">
              <Skeleton height={60} width="100%" />
            </div>

            <div className="upload-container">
              <Skeleton height={40} width="100%" />
            </div>
          </div>

          {/* Bank Details */}
          <div className="bankdetails">
            <div className="bankheading">
              <Skeleton height={25} width={200} />
              <Skeleton height={36} width={140} />
            </div>
            <div className="bank-detailsform">
              <div className="first-column">
                <Skeleton height={40} width="100%" />
                <Skeleton height={40} width="100%" />
              </div>
              <div className="first-column">
                <Skeleton height={40} width="100%" />
                <Skeleton height={40} width="100%" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Menu Section */}
       
      </div>
    </div>
  );
};

export default AccountPageSkeleton;
