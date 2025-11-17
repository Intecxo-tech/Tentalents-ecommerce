'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import './forgotpassword.css';

type FormData = {
  email: string;
  password: string;
};

const API_BASE = 'https://userservice.zeabur.app/api/auth';

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // Timer for OTP resend
  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
const API_BASE = 'http://userservice.zeabur.app/api/auth';

  // -------------------- API MUTATIONS --------------------
  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await fetch(`${API_BASE}/forgot-password/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to send OTP');
      }
      return res.json();
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      startTimer();
    },
    onError: (err: any) => {
      setServerError(err.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) throw new Error('Email is missing');
      const res = await fetch(`${API_BASE}/forgot-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: otp.join('') }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Invalid OTP');
      }
      return res.json();
    },
    onSuccess: () => {
      setStep('reset');
      setServerError(null);
      reset();
    },
    onError: (err: any) => {
      setServerError(err.message);
    },
  });

const resetPasswordMutation = useMutation({
  mutationFn: async ({ password }: { password: string }) => {
    if (!userEmail) throw new Error('Email is missing');
    const res = await fetch(`${API_BASE}/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        otp: otp.join(''),       // OTP
        newPassword: password,   // Backend expects 'newPassword'
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.error || 'Failed to reset password');
    }
    return res.json();
  },
  onSuccess: () => router.push('/login'),
  onError: (err: any) => setServerError(err.message),
});



  // -------------------- FORM HANDLERS --------------------
  const onSubmitEmail = (data: FormData) => {
    requestOtpMutation.mutate({ email: data.email });
  };

  const onSubmitPassword = (data: FormData) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  // -------------------- OTP INPUT HANDLERS --------------------
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        <div className="forgot-heading">
          <button onClick={() => router.back()} className="bordered-button">
            <ChevronLeft />
          </button>
          <h1 className="heading">Forgot Password</h1>
        </div>

        <div className="forgot-box">
          {step === 'email' && (
            <form onSubmit={handleSubmit(onSubmitEmail)}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && <p className="error">{errors.email.message}</p>}
              </div>
             <button type="submit" className="forgot-button" disabled={requestOtpMutation.isPending}>
  {requestOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
</button>
              {serverError && <p className="error">{serverError}</p>}
            </form>
          )}

          {step === 'otp' && (
            <>
              <div className="otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    value={digit}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    type="text"
                  />
                ))}
              </div>
             <button
  className="forgot-button"
  disabled={verifyOtpMutation.isPending}
  onClick={() => verifyOtpMutation.mutate()}
>
  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
</button>

              {canResend ? (
                <button
                  className="resend-button"
                  onClick={() => {
                    if (userEmail) requestOtpMutation.mutate({ email: userEmail });
                    setOtp(['', '', '', '', '', '']);
                  }}
                >
                  Resend OTP
                </button>
              ) : (
                <p style={{ textAlign: 'center', marginTop: '6px', color: '#777' }}>
                  Resend OTP in {timer}s
                </p>
              )}
              {serverError && <p className="error">{serverError}</p>}
            </>
          )}

          {step === 'reset' && (
            <form onSubmit={handleSubmit(onSubmitPassword)}>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="New Password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                {errors.password && <p className="error">{errors.password.message}</p>}
              </div>
              <button type="submit" className="forgot-button" disabled={resetPasswordMutation.isPending}>
  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
</button>
              {serverError && <p className="error">{serverError}</p>}
            </form>
          )}
        </div>

        <div className="bottom-links">
          <p>
            Remember your password? <Link href="/login">Login Here</Link>
          </p>
          <p style={{ marginTop: 8 }}>
            <Link href="/signup">New User? Sign Up Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
