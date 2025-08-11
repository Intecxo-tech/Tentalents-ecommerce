import { signOut, User } from 'firebase/auth';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase/firebase.config';
import { withAuth } from '../components/withAuth';

const auth = getAuth(app);

interface VendorDashboardProps {
  user: User;
}

const VendorDashboard = ({ user }: VendorDashboardProps) => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.replace('/vendor/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
      <p className="mb-2">Welcome, {user.displayName || 'Vendor'}</p>
      <p className="mb-6 text-gray-600">Email: {user.email || 'No email available'}</p>

      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className={`px-4 py-2 rounded text-white ${
          logoutLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        } transition`}
        aria-label="Logout"
      >
        {logoutLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default withAuth(VendorDashboard);
