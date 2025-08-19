import React, { Suspense } from 'react';
import OrderSuccess from './OrderSuccess';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading order success page...</div>}>
      <OrderSuccess />
    </Suspense>
  );
}
