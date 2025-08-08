'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase.config';
import { useRouter } from 'next/navigation';

export default function VendorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/vendor/dashboard'); // vendor dashboard
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">Vendor Login</h2>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="w-full border px-3 py-2"
          type="email"
          placeholder="Vendor Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
}
