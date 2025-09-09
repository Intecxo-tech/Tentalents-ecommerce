'use client';

import React from 'react';
import './orderform.css';

interface TrackingStep {
  label: string;
  dateTime: string;
}

interface OrderTrackingProps {
  steps: TrackingStep[];
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ steps }) => {
  return (
    <div className="tracking-container">
      {steps.map((step, index) => (
        <div key={index} className="tracking-step">
          <div className="dot-line-wrapper">
            <span className="dot" />
            {index !== steps.length - 1 && <span className="line" />}
          </div>
          <div className="tracking-info">
            <p className="tracking-label">{step.label}</p>
            <p className="tracking-datetime">{step.dateTime}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTracking;
