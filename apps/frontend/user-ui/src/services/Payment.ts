import axios from 'axios';

const PAYMENT_API_BASE = process.env.NEXT_PUBLIC_PAYMENT_API_LINK ?? 'https://payment-service-byd5.onrender.com/api/payment';

// Function to initiate payment
export const initiatePayment = async (orderId: string, amount: number) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(
    PAYMENT_API_BASE,
    { orderId, amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data; // { checkoutUrl, ... }
};

// Function to verify payment status
export const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(PAYMENT_API_BASE, {
    params: { paymentId, orderId, signature },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
  
};

// New function to send the payment status after the payment is complete
export const sendPaymentStatus = async (orderId: string, paymentStatus: string) => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.post(
      `${PAYMENT_API_BASE}/update-status`, // Update endpoint in your backend
      { orderId, paymentStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error sending payment status:', error);
    throw new Error('Failed to send payment status');
  }
};
