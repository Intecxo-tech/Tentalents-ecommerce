'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Google from '../../../assets/google.png';
import './login.css';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import {jwtDecode} from 'jwt-decode';
type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // ✅ Check if already logged in
 useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (!isExpired) {
        router.replace('/myaccount');
      } else {
        localStorage.removeItem('token'); // remove expired token
      }
    } catch (err) {
      localStorage.removeItem('token'); // if invalid token
    }
  }
}, [router]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      const token = result?.data?.token;
      if (!token) throw new Error('Token missing in response');

      // ✅ Save token to localStorage
      localStorage.setItem('token', token);
      toast.success('Login successful!');
      router.push('/myaccount');
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in');
    // TODO: Implement Google login logic
  };

  return (
    <div className="login-page">
      <div className="logincontainer">
        <div className="login-heading">
          <button className="bordered-button">
            <ChevronLeft />
          </button>
          <h1 className="heading">Login</h1>
        </div>

        <div className="login-box">
          <button className="google-button" onClick={handleGoogleSignIn}>
            <Image src={Google} alt="Google" width={20} height={20} />
            Continue With Google
          </button>

          <div className="divider" />

          <form onSubmit={handleSubmit(onSubmit)}>
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

            <div className="form-group">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Your Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>

            <div className="options">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember My Password
            </div>

            <button type="submit" className="background-buttonver" disabled={loading}>
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>
        </div>

        <div className="bottom-links">
          <p>
            Are You A New User? <Link href="/signup">Sign Up Here</Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            <Link href="/forgot-password">Forgot Password ?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
