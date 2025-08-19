'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    // Parse the hash fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token) {
      // Store tokens (you could use cookies, sessionStorage, etc.)
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      // Redirect to home or dashboard
      router.push('/');
    } else {
      console.error('No access token found in URL');
      router.push('/login'); // fallback
    }
  }, [router]);

  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
};

export default AuthCallback;
