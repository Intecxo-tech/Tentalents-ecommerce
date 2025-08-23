import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import Google from '../../../assets/google.png';
import Image from 'next/image';
type Props = {
  email: string;
  setEmail: (email: string) => void;
  setStep: (step: 'email' | 'otp' | 'password') => void;
  mode: 'login' | 'signup';
  loading: boolean;
  setLoading: (state: boolean) => void;
    onGoogleSignIn?: () => Promise<void>; 
};

const EmailStep = ({ email, setEmail, setStep, mode, loading, setLoading, onGoogleSignIn }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      const url =
        mode === 'signup'
          ? '/api/auth/register/otp/initiate'
          : '/api/auth/login/otp/initiate';

      await axios.post(`https://user-service-e1em.onrender.com/api/auth/register/otp/initiate`, { email });

      toast.success('OTP sent successfully!');
      setEmail(email);
      setStep('otp');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
  <form onSubmit={handleSubmit(onSubmit)} className='register-form'>
    <input
      type="email"
      placeholder="Enter your email"
      defaultValue={email}
      {...register('email', { required: 'Email is required' })}
      disabled={loading}
    />
    {errors.email && <p className="error">{errors.email.message}</p>}
    <button type="submit" className="background-buttonver" disabled={loading}>
      {loading ? 'Sending OTP...' : 'Send OTP'}
    </button>

{/* <div className='divider'/> */}

      {mode === 'signup' && onGoogleSignIn && (
    <button
      type="button"
      onClick={onGoogleSignIn}
      className="google-button"
      disabled={loading}
      style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Image src={Google} alt="Google Icon" width={20} height={20} style={{ marginRight: '8px' }} />
      Continue with Google
    </button>
  )}
  </form>

  {/* Google button, only for signup mode */}

</>

  );
};

export default EmailStep;
