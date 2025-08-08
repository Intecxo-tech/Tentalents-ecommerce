'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loginWithGoogle } from '../../firebase/auth.service';

import axios from 'axios';

export default function SellerGoogleLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Step 1: Sign in with Firebase
      const idToken = await loginWithGoogle();
      console.log('Firebase ID token:', idToken);

      // Step 2: Verify with backend (optional, but recommended)
      const response = await axios.post('/api/auth/seller/google', { idToken });

      const { sessionToken, seller } = response.data;

      // Step 3: Store session
      localStorage.setItem('sessionToken', sessionToken);
      localStorage.setItem('seller', JSON.stringify(seller));

      // Step 4: Redirect to seller dashboard
      router.push('/seller-ui/dashboard');
    } catch (err) {
      console.error('Google login failed:', err);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Seller Login</h2>
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#34A853',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google (Seller)'}
      </button>
    </div>
  );
}
