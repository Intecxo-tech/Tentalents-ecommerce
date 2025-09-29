// src/app/(routes)/login/page.tsx (or whichever file wraps LoginClient.tsx)
import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

// A simple loading component to show as a fallback
const LoadingFallback = () => {
  return (
    <div className="login-page">
      <div className="logincontainer" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading...</h2>
      </div>
    </div>
  );
};

const Page = () => {
  // 🚨 IMPORTANT: The component that uses useSearchParams MUST be inside Suspense
  // or a child of a component that is inside Suspense.
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginClient />
    </Suspense>
  );
};

export default Page; // Rename 'Page' to 'LoginPage' for clarity
