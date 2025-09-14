// app/login/page.tsx (or wherever you render <Login />)
import React, { Suspense } from 'react';
import Login from './login';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <Login />
    </Suspense>
  );
}
