// app/signup/page.tsx

import { Suspense } from 'react';
import SignUpPage from './SignupClient';
function Loading() {
  return <div>Loading your signup form...</div>;
}
export default function Page() {
   <Suspense fallback={<Loading />}>
  return <SignUpPage />;
  </Suspense>
}
