// SignupClientWrapper.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import SignUpForm from './signupForm';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const queryObject: Record<string, string> = {};

  // Safely convert URLSearchParams to a simple key-value object
  searchParams.forEach((value, key) => {
    queryObject[key] = value;
  });

  // Render your main form component with the clean props
  return <SignUpForm searchParams={queryObject} />;
}