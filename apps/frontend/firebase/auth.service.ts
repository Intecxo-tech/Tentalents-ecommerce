import { auth, googleProvider } from './firebase.config';
import { signInWithPopup } from 'firebase/auth';

export const loginWithGoogle = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

export const sendTokenToBackend = async (
  idToken: string,
  userType: 'user' | 'seller'
): Promise<any> => {
  const endpoint = userType === 'seller' ? '/api/seller/auth' : '/api/auth';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Backend auth failed:', error);
    throw error;
  }
};
