// app/signup/page.tsx
import SignUpForm from './signupForm';
import { Suspense } from 'react';

// You no longer need dynamic import with ssr: false
// The "use client" directive in SignUpForm.tsx handles this.

function Loading() {
  return <div>Loading your signup form...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      {/* Render the client component directly */}
      <SignUpForm />
    </Suspense>
  );
}