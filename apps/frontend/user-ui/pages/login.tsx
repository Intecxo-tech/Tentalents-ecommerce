'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loginWithGoogle } from '../../firebase/auth.service';

import axios from 'axios';

export default function UserGoogleLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Step 1: Firebase Google Login
      const idToken = await loginWithGoogle();
      console.log('Firebase ID Token:', idToken);

      // Step 2: Call backend API to verify and get a session token
      const response = await axios.post('/api/auth/user/google', { idToken });

      const { sessionToken, user } = response.data;

      // Step 3: Store session info
      localStorage.setItem('sessionToken', sessionToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Step 4: Redirect to dashboard
      router.push('/user-ui/dashboard');
    } catch (err) {
      console.error('Google login failed:', err);
      alert('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>User Login</h2>
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google (User)'}
      </button>
    </div>
  );
}
