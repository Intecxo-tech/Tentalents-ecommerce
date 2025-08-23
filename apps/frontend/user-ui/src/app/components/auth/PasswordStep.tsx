import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Props = {
  email: string;
  otp: string;
  mode: 'login' | 'signup';
  loading: boolean;
  setLoading: (val: boolean) => void;
};

type FormData = {
  password: string;
  confirmPassword?: string;
};

const PasswordStep = ({ email, otp, mode, loading, setLoading }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        await axios.post(`https://user-service-e1em.onrender.com/api/auth/register/otp/complete`, {
          email,
          password: data.password,
        });

        toast.success('Account created!');
        router.push('/login');
      } else {
        const res = await axios.post(`https://user-service-e1em.onrender.com/api/auth/login/otp/complete`, {
          email,
          password: data.password,
        });

        const token = res.data?.data?.token;
        localStorage.setItem('token', token);
        toast.success('Logged in!');
        router.push('/myaccount');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='register-form'>
      <input
        type="password"
        placeholder="Password"
        {...register('password', { required: 'Password is required' })}
      />
      {errors.password && <p className="error">{errors.password.message}</p>}

      {mode === 'signup' && (
        <>
          <input
            type="password"
            placeholder="Confirm Password"
            {...register('confirmPassword', {
              validate: (val) =>
                val === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
        </>
      )}

      <button type="submit" disabled={loading} className="background-buttonver">
        {loading ? 'Submitting...' : mode === 'signup' ? 'Complete Signup' : 'Login'}
      </button>
    </form>
  );
};

export default PasswordStep;
