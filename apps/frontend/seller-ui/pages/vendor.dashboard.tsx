// pages/vendor-dashboard.tsx
import { useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../../firebase/firebase.config';

const auth = getAuth(app);

export const VendorDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/vendor/login');
      } else {
        setUser(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/vendor/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Vendor Dashboard</h1>
      <p className="mb-2">Welcome, {user.displayName}</p>
      <p className="mb-4 text-gray-600">Email: {user.email}</p>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};
