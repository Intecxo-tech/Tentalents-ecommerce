'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Google from '../../../assets/google.png';
import './login.css';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, provider } from '../../../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../auth/callback/AuthContext';

type FormData = {
  email: string;
  password: string;
};

const LoginClient = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [isTokenPresent, setIsTokenPresent] = useState(false);
  const [mounted, setMounted] = useState(false);
  // const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
// const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
// useEffect(() => {
//   setMounted(true);
// }, []);
  useEffect(() => {
  setMounted(true);
}, []);
  // redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/shop');
    }
  }, [user, router]);

  // extract token once


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`https://user-service-zje4.onrender.com/api/auth/login`, {
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

      login({ token }); // ✅ use context login
      toast.success('Login successful!');
      router.push('/shop');
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const firebaseIdToken = await result.user.getIdToken();

      const res = await axios.post(`https://user-service-zje4.onrender.com/api/auth/google-login`, {
        provider: 'google',
        idToken: firebaseIdToken,
      });

      const token = res.data?.data?.token;
      if (!token) throw new Error('Token missing in response');

      login({ token }); // ✅ context login
      toast.success('Logged in successfully!');
      router.push('/shop');
    } catch (error) {
      console.error(error);
      toast.error('Google login failed.');
    } finally {
      setLoading(false);
    }
  };



// useEffect(() => {
    
//     const token = searchParams?.get('token');

//     if (token) {
//         setTokenFromUrl(token); // <--- THIS LINE CAUSES THE ERROR
//         
//         // ✅ FIX: Use native window.history to safely remove the token from the URL
//         // while remaining on the same page.
//         if (window.history.replaceState) {
//             const newUrl = new URL(window.location.href);
//             newUrl.searchParams.delete('token');
//             window.history.replaceState(null, '', newUrl.toString());
//         }
//     }
// }, [searchParams]);

    // auto-login if token exists
// Unified Token Detection, Auto-Login, and Redirect
useEffect(() => {
  if (!mounted) return; // ✅ wait until mounted

  const token = searchParams?.get('token');
  if (token) {
    try {
      // clean URL
      if (window.history.replaceState) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        window.history.replaceState(null, '', newUrl.toString());
      }

      login({ token });
      toast.success('Switched to customer account! Redirecting...');
      router.push('/shop');
    } catch (err) {
      console.error(err);
      toast.error('Invalid login token.');
    }
  }
}, [mounted, searchParams, login, router]);

if (!mounted) {
  // render nothing until mounted to prevent hydration mismatch
  return null;
}

    // --- RENDER LOGIC ---

// if (isTokenPresent) { 
//   return (
//       <div className="login-page">
//           <div className="logincontainer" style={{ textAlign: 'center', padding: '50px' }}>
//               <h2>{isRedirecting ? 'Redirecting...' : 'Switching to your customer account... 🔄'}</h2>
//               <p>Please wait while we complete the secure switch.</p>
//           </div>
//       </div>
//   );
// }

// 2. Initial loading state (Server output must match initial client output)
// if (!mounted) {
//     return (
//         <div className="login-page">
//             <div className="logincontainer" style={{ textAlign: 'center', padding: '50px' }}>
//                 <h2>Loading...</h2>
//             </div>
//         </div>
//     );
// }
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

export default LoginClient;
