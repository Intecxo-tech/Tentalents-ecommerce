'use client';

import React, { useState } from 'react';
import EmailStep from './EmailStep';
import OtpStep from './OtpStep';
import PasswordStep from './PasswordStep';
import { auth, provider } from '../../../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/callback/AuthContext'; // <-- import your auth hook here
import Google from '../../../assets/google.png';

type AuthFlowProps = {
  mode: 'login' | 'signup';
  onLoginSuccess?: (userData: any) => void; // optional prop
};

const AuthFlow = ({ mode, onLoginSuccess }: AuthFlowProps) => {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Get login and closeSidebar from context
  const { login, closeSidebar } = useAuth();

  // Centralized login success handler
  const handleLoginSuccess = (token: string) => {
    login({ token });        // Update auth state in context
    closeSidebar();          // Close sidebar UI
    onLoginSuccess?.(token); // If parent wants to handle further
  };

  const handleFirebaseGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const firebaseIdToken = await result.user.getIdToken();

      const res = await fetch(`https://user-service-e1em.onrender.com/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google',
          idToken: firebaseIdToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Google login failed');

      toast.success('Logged in successfully!');
      localStorage.setItem('token', data.token);

      handleLoginSuccess(data.token); // Use centralized login handler here
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 'email' && (
        <EmailStep
          email={email}
          setEmail={setEmail}
          setStep={setStep}
          mode={mode}
          setLoading={setLoading}
          loading={loading}
          onGoogleSignIn={handleFirebaseGoogleSignIn}
        />
      )}

      {step === 'otp' && (
        <OtpStep
          email={email}
          setOtp={setOtp}
          otp={otp}
          setStep={setStep}
          mode={mode}
          setLoading={setLoading}
          loading={loading}
        />
      )}

      {step === 'password' && (
        <PasswordStep
          email={email}
          otp={otp}
          mode={mode}
          loading={loading}
          setLoading={setLoading}
          onLoginSuccess={handleLoginSuccess} // Use centralized handler here
        />
      )}
    </>
  );
};

export default AuthFlow;
