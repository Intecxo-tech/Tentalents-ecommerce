'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');

  const [message, setMessage] = useState<string | null>('Loading payment details...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) return;

    fetch(`https://payment-service-ir49.onrender.com/api/payments/stripe-session/${session_id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch payment info');
        return res.json();
      })
      .then(data => {
        if (data.payment && data.payment.status === 'success') {
          setMessage('Payment Successful! Your order is confirmed.');
          setTimeout(() => {
            router.push('/orders');
          }, 5000);
        } else {
          setMessage('Payment pending or failed. Please check your order status.');
        }
      })
      .catch(err => {
        setError(err.message);
        setMessage(null);
      });
  }, [session_id, router]);

  if (error) return <div>Error: {error}</div>;
  if (message) return <div>{message}</div>;
  return null;
}


