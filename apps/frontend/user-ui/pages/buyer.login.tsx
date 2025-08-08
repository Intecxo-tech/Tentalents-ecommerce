// pages/buyer-login.tsx
import { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth, googleProvider } from '../firebase/firebase.config'; // adjust path if needed

const BuyerLogin = () => {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleRedirectResult() {
      console.log('Checking redirect result...');
      try {
        const result = await getRedirectResult(auth);
        console.log('Redirect result:', result);

        if (result?.user) {
          const idToken = await result.user.getIdToken();
          console.log('Redirect ID Token:', idToken);

          // Optional: validate token with backend
          const res = await fetch('/api/auth/firebase-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
          });
          console.log('Redirect backend response status:', res.status);

          if (!res.ok) throw new Error('Token validation failed');
          router.push('/buyer/dashboard');
        }
      } catch (err: any) {
        console.error('Redirect login failed:', err);
        setError('Login failed. Please try again.');
      }
    }

    handleRedirectResult();
  }, [router]);

  const handleGooglePopupLogin = async () => {
    console.log('Popup login started');
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Popup login success:', result.user);

      const idToken = await result.user.getIdToken();
      console.log('Got ID Token:', idToken);

      // Optional: validate token with backend
      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      console.log('Backend response status:', res.status);

      if (!res.ok) throw new Error('Authentication failed');

      router.push('/buyer/dashboard');
    } catch (err: any) {
      console.error('Popup login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleRedirectLogin = () => {
    console.log('Starting redirect login');
    signInWithRedirect(auth, googleProvider);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Buyer Login</h2>

        <button
          onClick={handleGooglePopupLogin}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Sign in with Google (Popup)
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
};

export default BuyerLogin;
