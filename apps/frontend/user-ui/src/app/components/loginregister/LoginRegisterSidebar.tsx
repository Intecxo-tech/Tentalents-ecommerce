'use client';

import React, { useEffect, useRef, useState } from 'react';
import './loginregister.css';
import toast from 'react-hot-toast';
// import AuthFlow from '../auth/Authflow'; 
import '../../(routes)/login/login.css';
import { auth, provider } from '../../../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import Image from 'next/image';
import Google from '../../../assets/google.png';
import { useAuth } from '../../auth/callback/AuthContext';
// import SignUpForm from '../signupflow/signupflow'
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
};

const API_URL = 'https://user-service-e1em.onrender.com/api/auth';

const LoginRegisterSidebar = ({ isOpen, onClose, onLoginSuccess }: Props) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    toast.success('Login Successful');

    // ✅ Save token in localStorage
    const token = data.token || data.data?.token;
if (!token) throw new Error('No token received from login response');

localStorage.setItem('token', token);
login({ token }); // <-- Add this line
  

    // ✅ Optional callback (e.g. for parent)
    onLoginSuccess?.(data);

    onClose();
  } catch (err: any) {
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

    const res = await fetch(`https://user-service-e1em.onrender.com/api/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        idToken: firebaseIdToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Google login failed');

    toast.success('Logged in successfully!');
    localStorage.setItem('token', data.token);
    console.log('Login response data:', data);
    onLoginSuccess?.({
  token: data.token || data.data.token,  // handle both login and Google response
});
    onClose();
  } catch (error: any) {
    toast.error(error.message || 'Google login failed');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="loginregisterpopup" ref={formRef}>
        <div className="login-sidebarheading">
          <h2 className="heading">{isLogin ? 'Login' : 'Register'}</h2>
          <button className="bordered-button" onClick={onClose}>
            Close
          </button>
        </div>

        {/* ✅ Login form */}
        {isLogin ? (
          <form  className='sidebar-loginform'  onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="background-buttonver" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
 <div className="divider" />
            <button
  type="button"
  onClick={handleFirebaseGoogleSignIn}
  className="google-button"
  disabled={loading}
>
  <Image src={Google} alt="Google Icon" width={20} height={20} style={{ marginRight: '8px' }} />
  Continue with Google
</button>

 <div className="bottom-links">
          {isLogin ? (
            <p>
              Don’t have an account?{' '}
              <span onClick={() => setIsLogin(false)} className='primary'>Register</span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span onClick={() => setIsLogin(true)} className='primary'>Login</span>
            </p>
          )}
        </div>
          </form>
          
        ) : (
          // ✅ Register flow using your AuthFlow component
          <div style={{ padding: '1rem 0' }}>
{/* <SignUpForm
  onSuccess={(token) => {
    login({ token });
    localStorage.setItem('token', token);
    toast.success('Logged in successfully!');
    onClose();
  }}
/> */}

          </div>
        )}

       
      </div>
    </div>
  );
};

export default LoginRegisterSidebar;
