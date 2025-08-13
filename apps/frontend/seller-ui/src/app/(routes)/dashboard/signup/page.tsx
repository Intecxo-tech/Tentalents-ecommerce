'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Google from '../../../assets/google.png';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './signup.css';
import toast from 'react-hot-toast';
import  {jwtDecode} from "jwt-decode";


const maskEmail = (email: string) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;

  const maskedUser =
    user.length <= 2
      ? user[0] + '*'.repeat(user.length - 1)
      : user[0] + '*'.repeat(user.length - 2) + user.slice(-1);

  return `${maskedUser}@${domain}`;
};

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  businessName?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  profileImage?: FileList;
  kycDocsUrl?: FileList;
};

const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false,
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<FormData>();
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    capital: false,
    specialChar: false,
  });

  // Timer effect for OTP resend
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    if (!canResend && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  // Removed Supabase session check here

  const handleSendOtp = async () => {
    const token = localStorage.getItem('token');
  const isValid = await trigger('email');
  if (!isValid) return;

  setLoading(true);
  try {
    const { email: enteredEmail } = getValues();
    console.log('Sending OTP to:', enteredEmail);
    console.log('Using API:', `${process.env.NEXT_PUBLIC_VENDOR_URI}/api/vendor/register/initiate-otp`);
    console.log('JWT Token:', token);
 // or wherever you store it

await axios.post(
  `${process.env.NEXT_PUBLIC_VENDOR_URI}/api/vendor/register/initiate-otp`,
  { email: enteredEmail },

);

    setEmail(enteredEmail);
    setStep('otp');
    setCanResend(false);
    setTimer(60);
    setOtp(Array(6).fill(''));
  } catch (err: any) {
    console.error('OTP send error:', err);
    const errorMessage = err?.response?.data?.message || err?.response?.data?.error;

    if (errorMessage === 'Vendor already exists') {
      toast.error('This email is already registered. Please login or use a different email.');
    } else {
      toast.error(errorMessage || 'OTP verification failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter 6 digit OTP');
      return;
    }

    setLoading(true);
    try {
    const token = localStorage.getItem('token'); // fetch token again
await axios.post(
  `${process.env.NEXT_PUBLIC_VENDOR_URI}/api/vendor/register/verify-otp`,
  {
    email,
    otp: otpCode,
  },
 
);
      setStep('password');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const onSubmit = async (data: FormData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    console.log('Using JWT Token:', token);

    // Register password
    await axios.post(
      `${process.env.NEXT_PUBLIC_VENDOR_URI}/api/vendor/register/user`,
      {
        email,
        password: data.password,
      },
    );

    toast.success('Vendor registered successfully!');  // change toast message here
    router.push('/dashboard/myaccount');  // redirect directly to /myaccount
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Registration error. Please try again.');
  } finally {
    setLoading(false);
  }
};




  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = async () => {
    if (!email) return;

    setLoading(true);
    try {
     const token = localStorage.getItem('token');
await axios.post(
  `${process.env.NEXT_PUBLIC_VENDOR_URI}/api/vendor/register/initiate-otp`,
  { email },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      setCanResend(false);
      setTimer(60);
      setOtp(Array(6).fill(''));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (field: 'password' | 'confirmPassword') => {
    setPasswordVisible((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleGoogleSignIn = async () => {
    // If you want to keep Google sign-in, you need to handle it differently or remove this as well
    toast.error('Google sign-in is currently disabled.');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setPasswordRules({
      length: val.length >= 8,
      capital: /[A-Z]/.test(val),
      specialChar: /[@#%$]/.test(val),
    });
  };

  return (
    <div className="login-page">
      <div className="logincontainer">
        <div className="login-heading">
          <button className="bordered-button" onClick={() => router.back()}>
            <ChevronLeft />
          </button>
          <h1 className="heading">Sign Up</h1>
          <div className="spacer" />
        </div>

        {step === 'email' && (
          <>
            <button className="google-button" onClick={handleGoogleSignIn} disabled={loading}>
              <Image src={Google} alt="Google Logo" width={20} height={20} />
              Continue With Google
            </button>

            <div className="divider" />

            <form>
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
                  disabled={loading}
                />
                {errors.email && <p className="error">{errors.email.message}</p>}
              </div>

              <button
                type="button"
                className="background-buttonver"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <div className="otp-verification-container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: '600', fontSize: '1.25rem' }}>We've Emailed You A Code</h2>
            <p style={{ color: '#888', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              To change your password enter the code we have emailed you on{' '}
              <strong>{maskEmail(email)}</strong>
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={{
                    width: '3rem',
                    height: '3rem',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                  }}
                  className="otp-input"
                  disabled={loading}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{
                width: '100%',
                maxWidth: '320px',
                backgroundColor: '#f1592a',
                color: '#fff',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '0.75rem 0',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <p style={{ marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>
              Didn't Receive An Email?{' '}
              {canResend ? (
                <button
                  onClick={resendOtp}
                  style={{
                    color: '#f1592a',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                  disabled={loading}
                >
                  Resend
                </button>
              ) : (
                `Resend in ${timer}s`
              )}
            </p>
          </div>
        )}

        {step === 'password' && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type={passwordVisible.password ? 'text' : 'password'}
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/,
                    message: 'Include capital & special character',
                  },
                })}
                onChange={(e) => {
                  handlePasswordChange(e);
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePassword('password')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                }}
                tabIndex={-1}
              >
                {passwordVisible.password ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password && <p className="error">{errors.password.message}</p>}
            </div>

            {/* New password requirement checkboxes */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: passwordRules.length ? 'green' : 'red',
                }}
              >
                <input type="checkbox" checked={passwordRules.length} readOnly />
                Must be at least 8 characters long
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: passwordRules.capital ? 'green' : 'red',
                }}
              >
                <input type="checkbox" checked={passwordRules.capital} readOnly />
                Must contain a capital letter
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: passwordRules.specialChar ? 'green' : 'red',
                }}
              >
                <input type="checkbox" checked={passwordRules.specialChar} readOnly />
                Must contain a special character (@, #, %, $)
              </label>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type={passwordVisible.confirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                {...register('confirmPassword', {
                  required: 'Confirm Password is required',
                  validate: (value) =>
                    value === getValues('password') || 'Passwords do not match',
                })}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePassword('confirmPassword')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                }}
                tabIndex={-1}
              >
                {passwordVisible.confirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
            </div>

            <div className="options">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#777',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  style={{ transform: 'scale(1.1)', marginRight: '4px' }}
                  disabled={loading}
                />
                <span>
                  By clicking you agree on{' '}
                  <Link href="#" style={{ color: '#f1592a', textDecoration: 'underline' }}>
                    terms and conditions
                  </Link>{' '}
                  of tenttalents
                </span>
              </label>
            </div>

            <button type="submit" className="background-buttonver" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}
      

      </div>
    </div>
  );
};

export default SignUp;
