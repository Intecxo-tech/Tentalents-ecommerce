import React from 'react';
import { auth, googleProvider } from '../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import { sendTokenToBackend } from '../firebase/auth.service';

export const LoginPage = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(); // 🔐 Firebase ID token
      await sendTokenToBackend(idToken); // 📤 Send to your API for validation
    } catch (err) {
      console.error("Google login error", err);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
};