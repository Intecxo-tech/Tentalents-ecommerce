'use client';

// All your existing imports
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Google from '../../assets/google.png';
import { ChevronLeft, Eye, EyeOff, Upload } from 'lucide-react';
import axios from 'axios';
import './signup.css';
import toast from 'react-hot-toast';
import { jwtDecode } from "jwt-decode";
import Menu from '../../shared/components/menu/menu';
import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from "firebase/auth";

// All your existing types and helper functions
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

declare global {
  interface Window {
    google: any;
  }
}

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  businessName: string;
  phone?: string;
  address: string;
  gstNumber?: string;
  profileImage?: FileList;
  kycDocsUrl?: FileList;
  panNumber: string;
  aadharNumber: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  upiId?: string;
};

// Define the props for your UI component.
// It now expects a simple object, not the complex Next.js type.
type SignUpFormProps = {
  searchParams: Record<string, string>;
};


// ========================================================================
// 1. YOUR MAIN SIGNUP COMPONENT (RENAMED TO SignUpForm)
// This component contains all your original UI and logic.
// ========================================================================
const SignUpForm = ({ searchParams }: SignUpFormProps) => {
  // All your existing state, hooks, and functions go here...
  const [passwordVisible, setPasswordVisible] = useState({ password: false, confirmPassword: false });
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'profile' | 'bankDetails'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [kycFileNames, setKycFileNames] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const kycInputRef = useRef<HTMLInputElement>(null);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [pendingVendorId, setPendingVendorId] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm<FormData>();
  const [passwordRules, setPasswordRules] = useState({ length: false, capital: false, specialChar: false });

  // Your useEffect hook no longer needs the getQueryParam helper
  // because the wrapper provides simple string values.
  useEffect(() => {
    const { vendorId, name, phone, email: emailParam, token } = searchParams;

    if (vendorId) {
      setPendingVendorId(vendorId);
      setIsUpgrade(true);

      if (token) {
        localStorage.setItem("token", token);
        try {
          const decodedToken: { userId: string } = jwtDecode(token);
          localStorage.setItem("userId", decodedToken.userId);
        } catch (error) {
          console.error("Failed to decode token from URL:", error);
          toast.error("Invalid session link.");
        }
      }

      if (name) setValue("name", decodeURIComponent(name));
      if (phone) setValue("phone", phone);
      if (emailParam) {
        setEmail(emailParam);
        setValue("email", emailParam);
      }
      setStep("profile");
    }
  }, [searchParams, setValue, router]);

  // All your other functions (handleSendOtp, handleVerifyOtp, etc.)
  // remain exactly the same.
  // ... (paste all your other handler functions here without any changes)
  // handleSendOtp, handleVerifyOtp, handleSetPassword, handleProfileSubmit, 
  // handleBankDetailsSubmit, handlePasswordChange, etc...

  // (For brevity, the rest of your handler functions are omitted here, 
  // but you should include them in your actual file)

  const handleSendOtp = async () => {
    const isValid = await trigger('email');
    if (!isValid) return;

    setLoading(true);
    try {
      const { email: enteredEmail } = getValues();
      await axios.post(
        `https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/register/initiate-otp`,
        { email: enteredEmail }
      );
      setEmail(enteredEmail);
      setStep('otp');
      setCanResend(false);
      setTimer(60);
      setOtp(Array(6).fill(''));
    } catch (err: any) {
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

useEffect(() => {
  const pendingProfileData = localStorage.getItem('pendingVendorProfile');

  if (pendingProfileData) {
    try {
      const profile = JSON.parse(pendingProfileData);
      setPendingVendorId(profile.id || '');
      setValue('name', profile.name || '');
      setValue('phone', profile.phone || '');
      if (profile.email) {
        setEmail(profile.email);
        setValue('email', profile.email);
      }
      setStep('profile');
      localStorage.removeItem('pendingVendorProfile');
    } catch (error) {
      console.error("Failed to parse pending vendor profile:", error);
      localStorage.removeItem('pendingVendorProfile');
    }
  }
}, [setValue]);


  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter 6 digit OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/register/verify-otp`,
        { email, otp: otpCode }
      );
      setStep('password');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/register/user`,
        { email, password: data.password }
      );

      const userId = response?.data?.userId;
      const newToken = response?.data?.token;

      if (!userId || !newToken) {
        throw new Error("User ID or Token was not returned from the backend");
      }

      localStorage.setItem('userId', userId);
      localStorage.setItem('token', newToken);

      setStep('profile');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    const isValid = await trigger(['name', 'businessName', 'panNumber', 'aadharNumber', 'address']);
    if (!isValid) return;
    setStep('bankDetails');
  };

const handleBankDetailsSubmit = async (data: FormData) => {
  const isValid = await trigger(['accountNumber', 'ifscCode', 'bankName']);
  if (!isValid) return;

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!userId || !token) throw new Error("User ID or token not found in storage");

    const allData = getValues();
    const kycFiles: string[] = [];
    const kycFilenames: string[] = [];

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    if (data.kycDocsUrl && data.kycDocsUrl.length > 0) {
      for (let i = 0; i < data.kycDocsUrl.length; i++) {
        const file = data.kycDocsUrl[i];
        const base64 = await toBase64(file);
        kycFiles.push(base64);
        kycFilenames.push(file.name);
      }
    }
   const payload = {
    userId,
    vendorId: pendingVendorId || undefined,
    vendorDetails: {
      name: allData.name,
      businessName: allData.businessName,
      panNumber: allData.panNumber,
      AadharNumber: allData.aadharNumber,
      gstNumber: allData.gstNumber,
      email,
      phone: allData.phone || '',
      address: allData.address,
    },
    bankDetails: {
      accountHolder: allData.name,
      accountNumber: allData.accountNumber,
      ifscCode: allData.ifscCode,
      bankName: allData.bankName,
      branchName: allData.branchName || '',
      upiId: allData.upiId || '',
    },
    kycFiles,
    kycFilenames,
  };
    const response = await axios.post(
      `https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/register/profile`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const completeToken = response.data?.token;
    if (!completeToken) throw new Error('Final login token not received from server.');

    localStorage.setItem('token', completeToken);
    toast.success('Vendor profile completed successfully!');
    router.push('/dashboard/myaccount');

  } catch (err: any) {
    console.error('Profile submission failed:', err);
    toast.error(err?.response?.data?.message || 'Failed to complete profile.');
  } finally {
    setLoading(false);
  }
};

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordRules({
      length: val.length >= 8,
      capital: /[A-Z]/.test(val),
      specialChar: /[@#%$]/.test(val),
    });
  };
const handleKycUploadClick = () => {
  kycInputRef.current?.click();
};
  const handleFirebaseGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const firebaseIdToken = await result.user.getIdToken();

      await axios.post(`${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_API}`, {
        provider: 'google',
        idToken: firebaseIdToken,
      });

      toast.success('Logged in successfully!');
      router.push('/myaccount');
    } catch (error) {
      console.error(error);
      toast.error('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (field: 'password' | 'confirmPassword') => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
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
      await axios.post(
        `https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/register/initiate-otp`,
        { email }
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
const handleBack = () => {
  if (isUpgrade) {
    if (step === 'bankDetails') setStep('profile');
    return;
  }
  if (step === 'otp') setStep('email');
  else if (step === 'password') setStep('otp');
  else if (step === 'profile') setStep('password');
  else if (step === 'bankDetails') setStep('profile');
};


  return (
    <div>
      <Menu />
      <div className="login-page">
        <div className="logincontainer">
          <div className="login-heading">
            <button className="bordered-button" onClick={handleBack}>
              <ChevronLeft />
            </button>
            <h1 className="heading">Sign Up</h1>
            <div className="spacer" />
          </div>

         {!isUpgrade && step === 'email' && (
            <>
              <button className="google-button" onClick={handleFirebaseGoogleSignIn} disabled={loading}>
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

          {!isUpgrade && step === 'otp' && (
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

         {!isUpgrade && step === 'password' && (
            <form onSubmit={handleSubmit(handleSetPassword)}>
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
                {loading ? 'Continuing...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleSubmit(handleProfileSubmit)}>
              <div className="first-column">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Business Name"
                    {...register('businessName', { required: 'Business name is required' })}
                  />
                  {errors.businessName && <p className="error">{errors.businessName.message}</p>}
                </div>
              </div>

              <div className="first-column">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="PAN Number"
                    {...register('panNumber', { required: 'PAN Number is required' })}
                  />
                  {errors.panNumber && <p className="error">{errors.panNumber.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Aadhar Number"
                    {...register('aadharNumber', { required: 'Aadhar Number is required' })}
                  />
                  {errors.aadharNumber && <p className="error">{errors.aadharNumber.message}</p>}
                </div>
              </div>

              <div className="first-column">
                <div className="form-group">
                  <input type="text" placeholder="GST Number" {...register('gstNumber')} />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Address"
                    {...register('address', { required: 'Address is required' })}
                  />
                  {errors.address && <p className="error">{errors.address.message}</p>}
                </div>
              </div>
      
             <div className="form-group" >
              <div className='upload-field' onClick={handleKycUploadClick}>
  <h2>Upload Incorporation certificate</h2>
  <Upload className='signup-cion' size={35} />
</div>
  <input
  type="file"
  multiple
  {...register('kycDocsUrl', {
    onChange: (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const names = Array.from(files).map(file => file.name);
        setKycFileNames(names);
      }
    }
  })}
  ref={(e) => {
    register('kycDocsUrl').ref(e);
    kycInputRef.current = e;
  }}
  style={{ display: 'none' }}
/>
</div>
              <button type="submit" className="background-buttonver" disabled={loading}>
                {loading ? 'Continuing...' : 'Continue '}
              </button>
            </form>
          )}

          {step === 'bankDetails' && (
            <form onSubmit={handleSubmit(handleBankDetailsSubmit)}>
              <div className="first-column">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Bank Account Number"
                    {...register('accountNumber', { required: 'Account number is required' })}
                  />
                  {errors.accountNumber && <p className="error">{errors.accountNumber.message}</p>}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    {...register('ifscCode', { required: 'IFSC code is required' })}
                  />
                  {errors.ifscCode && <p className="error">{errors.ifscCode.message}</p>}
                </div>
              </div>

              <div className="first-column">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    {...register('bankName', { required: 'Bank name is required' })}
                  />
                  {errors.bankName && <p className="error">{errors.bankName.message}</p>}
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Branch Name (Optional)" {...register('branchName')} />
                </div>
              </div>

              <div className="first-column">
                <div className="form-group">
                  <input type="text" placeholder="UPI ID (Optional)" {...register('upiId')} />
                </div>
              </div>
              <button type="submit" className="background-buttonver" disabled={loading}>
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;