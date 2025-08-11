// pages/google.login.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { loginWithGoogle } from '../firebase/auth.service';

export default function GoogleLogin() {
  const router = useRouter();
  const { role } = router.query;

  const handleLogin = async () => {
    try {
      const idToken = await loginWithGoogle();

      console.log('Firebase ID token:', idToken);

      // Simulate backend auth success by setting token
      localStorage.setItem('sessionToken', 'test-session-token');

      // Redirect based on role
      if (role === 'vendor') {
        router.push('/seller-ui/dashboard');
      } else {
        router.push('/user-ui/dashboard');
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <button onClick={handleLogin}>Sign in with Google (Test)</button>
  );
}
