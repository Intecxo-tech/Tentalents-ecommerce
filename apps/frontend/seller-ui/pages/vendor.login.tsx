'use client';

import { useEffect, useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '../../firebase/firebase.config'; // Adjust path if needed

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function VendorLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const idToken = await result.user.getIdToken();

          const res = await fetch('/api/auth/firebase-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!res.ok) throw new Error('Token validation failed');
          router.push('/vendor/dashboard');
        }
      })
      .catch(() => setError('Login failed. Please try again.'));
  }, [router]);

  const handleGooglePopupLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) throw new Error('Authentication failed');
      router.push('/vendor/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirectLogin = () => {
    signInWithRedirect(auth, provider);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Vendor Login</h2>

        <button
          onClick={handleGooglePopupLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in with Google (Popup)'}
        </button>

        <button
          onClick={handleGoogleRedirectLogin}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Sign in with Google (Redirect)
        </button>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}
