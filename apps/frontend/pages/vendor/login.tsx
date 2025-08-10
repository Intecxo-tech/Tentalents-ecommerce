'use client';

import { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '../../firebase/firebase.config';

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

          const res = await fetch('/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (!res.ok) throw new Error('Token validation failed');
          const { role } = await res.json();

          if (role === 'seller') router.replace('/vendor/dashboard');
          else router.replace('/vendor/login');
        }
      })
      .catch(() => setError('Login failed. Please try again.'));
  }, [router]);

  const handleGoogleRedirectLogin = () => {
    setLoading(true);
    setError('');
    signInWithRedirect(auth, provider);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Vendor Login</h2>

        <button
          onClick={handleGoogleRedirectLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : 'Sign in with Google'}
        </button>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}
