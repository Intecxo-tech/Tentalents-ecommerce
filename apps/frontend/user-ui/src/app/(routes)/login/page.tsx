import React, { Suspense } from 'react';
import LoginClient from './LoginClient'; // Import your new client component

// A simple loading component to show as a fallback
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