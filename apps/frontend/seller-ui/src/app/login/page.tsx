'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Google from '../../assets/google.jpg';
import './login.css';
import axios from 'axios';
import '../signup/signup.css';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import Menu from '../../shared/components/menu/menu';
import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from "firebase/auth";
import { Suspense } from 'react';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      try {
        const decoded: any = jwtDecode(urlToken);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (!isExpired) {
          localStorage.setItem('token', urlToken);
          if (decoded.vendorId) {
            localStorage.setItem('vendorId', decoded.vendorId);
          }
          toast.success('Login successful!');
          router.push('/dashboard/myaccount');
          return;
        } else {
          toast.error('Session expired. Please log in again.');
        }
      } catch (err) {
        console.error('Error decoding token from URL:', err);
        toast.error('Invalid token. Please log in.');
      }
    }

    // If no URL token, check for a token in local storage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (!isExpired) {
          router.push('/dashboard/myaccount');
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, [router, searchParams]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Incorrect email or password.');
        } else {
          throw new Error(result.message || 'Login failed');
        }
      }
      const token = result?.token;
      if (!token || typeof token !== 'string') throw new Error('Token missing in response');

      localStorage.setItem('token', token);

      const decoded: any = jwtDecode(token);
      if (decoded.vendorId) {
        localStorage.setItem('vendorId', decoded.vendorId);
      } else {
        console.warn("vendorId missing in token payload");
      }

      toast.success('Login successful!');
      router.push('/dashboard/myaccount');

    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const firebaseIdToken = await result.user.getIdToken();

      const res = await axios.post(`https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/google`, {
        provider: 'google',
        idToken: firebaseIdToken,
      });

      const token = res.data?.token;
      if (!token) throw new Error('Token missing in response');
      localStorage.setItem('token', token);
      toast.success('Logged in successfully!');
      router.push('/dashboard/myaccount');
    } catch (error) {
      console.error(error);
      toast.error('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-pagesidebar">
      <Menu />
      <div className="login-page">
        <div className="logincontainer">
          <div className="login-heading">
            <button className="bordered-button">
              <ChevronLeft />
            </button>
            <h1 className="heading">Login</h1>
          </div>

          <div className="login-box">
            <button className="google-button" onClick={handleFirebaseGoogleSignIn} disabled={loading}>
              <Image src={Google} alt="Google Logo" width={20} height={20} />
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
                {errors.password && <p className="error">{errors.password.message}</p>}
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
              Are You A New User? <Link href="/signup/page">Sign Up Here</Link>
            </p>
            <p style={{ marginTop: '8px' }}>
              <Link href="/forgot-password">Forgot Password ?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;