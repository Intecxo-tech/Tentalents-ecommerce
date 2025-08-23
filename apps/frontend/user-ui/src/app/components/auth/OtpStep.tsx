import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

type Props = {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  setStep: (step: 'email' | 'otp' | 'password') => void;
  mode: 'login' | 'signup';
  loading: boolean;
  setLoading: (state: boolean) => void;
};

const OtpStep = ({ email, otp, setOtp, setStep, mode, loading, setLoading }: Props) => {
  const [otpArray, setOtpArray] = useState(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpArray];
    updatedOtp[index] = value;
    setOtpArray(updatedOtp);
    setOtp(updatedOtp.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === 'signup'
          ? '/api/auth/register/otp/verify'
          : '/api/auth/login/otp/verify';

      await axios.post(`https://user-service-e1em.onrender.com${url}`, {
        email,
        otp,
      });

      setStep('password');
      toast.success('OTP verified!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            style={{
              width: '3rem',
              height: '3rem',
              fontSize: '1.5rem',
              textAlign: 'center',
              borderRadius: '8px',
              border: '1px solid #ccc',
              outline: 'none',
            }}
          />
        ))}
      </div>

      <button onClick={handleVerify} disabled={loading} className="background-buttonver">
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </div>
  );
};

export default OtpStep;
