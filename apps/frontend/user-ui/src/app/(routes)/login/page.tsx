// src/app/(routes)/login/page.tsx (or whichever file wraps LoginClient.tsx)
import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  
  return (
    <Suspense >
      <LoginClient />
    </Suspense>
  );
};

