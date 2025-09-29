import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

const LoadingFallback = () => {
  return <div>Loading...</div>;
};

const Page = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginClient />
    </Suspense>
  );
};

export default Page;
