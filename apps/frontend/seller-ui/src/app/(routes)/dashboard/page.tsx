'use client';

import React, { useEffect, useState } from 'react';
import AdminDashboard from '../dashboard/AdminDashboard/AdminDashboard';
import VendorDashboard from '../dashboard/VendorDashboard/VendorDashboard';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  role?: string;
  [key: string]: any;
}

const Page = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setRole(decoded.role || null);
    } catch (err) {
      console.error('Failed to decode token:', err);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {role === 'admin' ? <AdminDashboard /> : <VendorDashboard />}
    </div>
  );
};

export default Page;
