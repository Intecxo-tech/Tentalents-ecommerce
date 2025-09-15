'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './approve.css'; // Assuming your styles are similar to the original

const VendorApproveSkeleton: React.FC = () => {
  return (
    <div className="vendor-approval-container">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="vendorcard">
          <div className="cardstyles">
            <div className="vendordeatil">
              <div className="vendorleft">
                <Skeleton circle width={90} height={90} />
              </div>
              <div className="vendorright vendorright2">
                <div className="vendorname">
                  <Skeleton width={120} />
                  <div className="stars">
                    <Skeleton width={40} />
                    <Skeleton width={50} />
                  </div>
                </div>
                <p className="productslist">
                  <Skeleton width={150} />
                </p>
                <div className="catrgoies">
                  <Skeleton width={120} height={20} />
                  <Skeleton width={140} height={20} />
                  <Skeleton width={130} height={20} />
                </div>
              </div>
            </div>

            <div className="vendorbottom">
              <div className="personalsection">
                <div className="personalbox border-none">
                  <h2><Skeleton width={120} /></h2>
                  <div className="details">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="personalbox border-none">
                  <h2><Skeleton width={120} /></h2>
                  <div className="details">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                        <tr>
                          <td className="leftsidetext"><Skeleton width={100} /></td>
                          <td className="rightsidebar"><Skeleton width={150} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="approvalcontainer">
              <p><Skeleton width={100} /></p>
              <div className="buttons">
                <Skeleton width={80} height={40} />
                <Skeleton width={80} height={40} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorApproveSkeleton;
