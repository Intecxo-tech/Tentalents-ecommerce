'use client';

import { useSearchParams } from 'next/navigation';
import SignUp from './page'; // Assuming your main component is here

export default function SignupClientWrapper() {
  const searchParams = useSearchParams(); // Now it's valid!
  
  return <SignUp searchParams={searchParams} />;
}
