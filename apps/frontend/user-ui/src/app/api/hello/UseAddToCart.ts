import { useEffect, useState } from 'react';
import { addToCart } from './cartApi';
import axios from 'axios';

export function useAddToCart() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // no error if no token

      try {
        const res = await axios.get(`https://user-service-e1em.onrender.com/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(res.data.data.id);
      } catch (err) {
        // optionally clear userId and token if unauthorized
        setUserId(null);
        localStorage.removeItem('token');
      }
    };

    fetchUserId();
  }, []);

  async function handleAddToCart(product: any, quantity: number = 1) {
    if (!userId) {
      // No error state or throw here
      // Just return null to indicate no user logged in
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedCart = await addToCart(userId, product, quantity);
      return updatedCart;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    handleAddToCart,
    loading,
    error,
    userId,
  };
}


