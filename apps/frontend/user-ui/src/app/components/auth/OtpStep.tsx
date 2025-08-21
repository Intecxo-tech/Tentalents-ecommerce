import React, { useState } from 'react';
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

      await axios.post(`https://user-service-e1em.onrender.com/api/auth/register/otp/verify`, {
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
    <div>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        disabled={loading}
        placeholder="Enter OTP"
      />
      <button onClick={handleVerify} disabled={loading} className="background-buttonver">
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </div>
  );
};

export default OtpStep;
