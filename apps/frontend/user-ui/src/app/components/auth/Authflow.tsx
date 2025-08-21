'use client';

import React, { useState } from 'react';
import EmailStep from './EmailStep';
import OtpStep from './OtpStep';
import PasswordStep from './PasswordStep';

type AuthFlowProps = {
  mode: 'login' | 'signup';
};

const AuthFlow = ({ mode }: AuthFlowProps) => {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

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
        />
      )}
    </>
  );
};

export default AuthFlow;
