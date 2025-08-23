import { useState } from 'react';
import { addToCart } from './cartApi';
import { useAuth } from '../../auth/callback/AuthContext';

export function useAddToCart() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function handleAddToCart(product: any, quantity: number = 1) {
    if (!userId) {
      // No user logged in, return null
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
