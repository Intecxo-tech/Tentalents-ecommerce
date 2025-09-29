// src/app/(routes)/login/page.tsx
import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading login...</div>}>
      <LoginClient />
    </Suspense>
  );
}
