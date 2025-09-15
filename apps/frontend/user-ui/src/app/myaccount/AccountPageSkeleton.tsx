import React from 'react';
import './address.css'; // You'll define shimmer animation here

const AccountPageSkeleton = () => {
  return (
    <div className="accountpage">
      <div className="accountheader">
        <div className="skeleton-title shimmer" style={{ width: '200px', height: '24px' }} />
        <div className="skeleton-line shimmer" style={{ width: '120px', height: '16px' }} />
      </div>

      <div className="accountpagemain">
        {/* Left Section */}
        <div className="accountpage-leftsection">
          <div className="acountdetails">
            <div className="accountdetailsheader">
              <div className="skeleton-title shimmer" style={{ width: '180px', height: '20px' }} />
              <div className="skeleton-button shimmer" style={{ width: '100px', height: '32px' }} />
            </div>

            <div className="profiledetails">
              <div className="profiledetailsleft">
                <div className="skeleton-avatar shimmer" />
              </div>

              <div className="profiledetailsright">
                <div className="first-column">
                  <div className="skeleton-input shimmer" />
                  <div className="skeleton-input shimmer" />
                </div>
                <div className="first-column">
                  <div className="skeleton-input shimmer" />
                  <div className="skeleton-input shimmer" />
                </div>
              </div>
            </div>
          </div>

          <div className="skeleton-address shimmer" style={{ height: '150px', marginTop: '16px' }} />
        </div>

        {/* Right Section */}
      
      </div>
    </div>
  );
};

export default AccountPageSkeleton;
