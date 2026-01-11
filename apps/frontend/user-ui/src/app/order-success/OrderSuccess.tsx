'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');

  const [message, setMessage] = useState<string>('Verifying payment...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!session_id) {
      setMessage('Invalid session.');
      return;
    }

    // Function to check status
    const checkStatus = async () => {
      try {
        const res = await fetch(`https://paymentservice.zeabur.app/api/payments/stripe-session/${session_id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        
        // If payment is success OR pending (Stripe sometimes takes a moment)
        // We assume success if we have a valid session_id from Stripe return
        if (data.payment) {
           setMessage('Payment Successful! Redirecting to orders...');
           setIsSuccess(true);
        }
      } catch (err) {
        console.error(err);
        // If the API fails, we might still want to redirect the user to check their orders manually
        setMessage('Order processing. Redirecting...');
        setIsSuccess(true);
      }
    };

    checkStatus();
  }, [session_id]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/orders'); // <--- Redirect happens here
      }, 3000); // reduced to 3 seconds for better UX
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Order Status</h1>
      <p>{message}</p>
    </div>
  );
}
