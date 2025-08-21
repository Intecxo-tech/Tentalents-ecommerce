import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

type Props = {
  email: string;
  setEmail: (email: string) => void;
  setStep: (step: 'email' | 'otp' | 'password') => void;
  mode: 'login' | 'signup';
  loading: boolean;
  setLoading: (state: boolean) => void;
};

const EmailStep = ({ email, setEmail, setStep, mode, loading, setLoading }: Props) => {
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
    <form onSubmit={handleSubmit(onSubmit)}>
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
    </form>
  );
};

export default EmailStep;
