'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowBigRight, ChevronLeft } from 'lucide-react';
import './forgotpassword.css'; // import your new styles

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // Timer for resend OTP
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

  // Fake mutations (replace with real API calls)
  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Simulate API call
      return new Promise((res) => setTimeout(res, 1000));
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      startTimer();
    },
    onError: () => {
      setServerError('Failed to send OTP');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      return new Promise((res) => setTimeout(res, 1000));
    },
    onSuccess: () => {
      setStep('reset');
      setServerError(null);
      reset(); // reset password input
    },
    onError: () => {
      setServerError('Invalid OTP. Try again.');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      return new Promise((res) => setTimeout(res, 1000));
    },
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      setServerError('Failed to reset password.');
    },
  });

  const onSubmitEmail = (data: FormData) => {
    requestOtpMutation.mutate({ email: data.email });
  };

  const onSubmitPassword = (data: FormData) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only digits or empty

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
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
          <button onClick={() => router.back()} className='bordered-button'>
            <ChevronLeft />
          </button>
          <h1 className='heading'>Forgot Password</h1>
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
                   ref={(el) => {
  inputRefs.current[i] = el;
}}
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
                    setOtp(['', '', '', '']);
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
            Remember your password?{' '}
            <Link href="/login">Login Here</Link>
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
