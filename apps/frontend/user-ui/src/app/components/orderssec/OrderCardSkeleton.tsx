import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './ordercard.css'; // optional if it includes necessary styling

const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="orderpage">
      <div className="orderpageheader">
        <div className="orderpage-headerleft">
          <p className="ordervalue">
            <Skeleton width={120} />
          </p>
          <p className="ordervalue">
            <Skeleton width={180} />
          </p>
        </div>
        <div className="orderheader-right">
          <Skeleton width={120} height={32} />
        </div>
      </div>

      <div className="orderdetails">
        <div className="shipto">
          <p className="orderlabel">Ship To</p>
          <Skeleton count={2} height={20} />
        </div>

        <div className="payment-method">
          <p className="orderlabel">Payment Method</p>
          <Skeleton width={100} height={20} />
        </div>

        <div className="paymentamount">
          <p className="orderlabel">Payment Details</p>
          <Skeleton count={3} height={20} />
        </div>
      </div>

      <div className="orderupdates">
        <div className="ordervalueleft">
          <Skeleton width={200} />
        </div>
        <div className="ordervalueright">
          <Skeleton width={120} height={32} />
        </div>
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
