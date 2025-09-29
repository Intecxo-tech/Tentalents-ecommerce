'use client'
import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

const LoadingFallback = () => {
  return <div>Loading...</div>;
};

const Page = () => {
  return(
      <LoginClient />
   );
  
};

export default Page;
