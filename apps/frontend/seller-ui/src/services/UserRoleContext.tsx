'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserRoleContextProps {
  role: string | null;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextProps>({
  role: null,
  loading: true,
});

export const UserRoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('[UserRoleContext] Token:', token);

      if (!token) {
        setRole(null);
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // ⏱ Timeout safety

      const res = await fetch('https://vendorservice.zeabur.app/api/vendor/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error('[UserRoleContext] API returned error:', res.status);
        setRole(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('[UserRoleContext] Vendor data:', data);

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;
      const tokenRole = tokenPayload.role;

      const matchedVendor = data.vendors?.find((vendor: any) => vendor.userId === userId);
      const finalRole = matchedVendor ? tokenRole : null;

      console.log('[UserRoleContext] Final role:', finalRole);
      setRole(finalRole || null);
    } catch (error) {
      console.error('[UserRoleContext] Error fetching role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUserRole();
}, []);
 useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setRole(null);
          setLoading(false);
          return;
        }

        const res = await fetch('https://vendorservice.zeabur.app/api/vendor/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          setRole(null);
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Check which vendor matches the userId from the token
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.userId;

        const matchedVendor = data.vendors?.find((vendor: any) => vendor.userId === userId);
        const tokenRole = tokenPayload.role;

        const finalRole = matchedVendor ? tokenRole : null;

        setRole(finalRole || null);
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={{ role, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// 🔓 Custom Hook to use anywhere
export const useUserRole = () => {
  return useContext(UserRoleContext).role;
};

// Optional loading hook if needed
export const useUserRoleLoading = () => {
  return useContext(UserRoleContext).loading;
};
