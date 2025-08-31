// services/vendorOrderAPI.ts
// src/api/getVendorOrders.ts
import axios from 'axios';
import type { VendorOrder } from '../configs/global';

export const getVendorOrders = async (): Promise<VendorOrder[]> => {
  // 1. Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 2. Make the API call with Authorization header
  const response = await axios.get('https://order-service-faxh.onrender.com/api/orders/vendor/orders', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });

  // 3. Return only the data array
  return response.data.data;
};

// export async function fetchVendorOrders(token: string) {
//   const res = await fetch('http://localhost:3002/api/vendor/orders', {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error('Failed to fetch vendor orders');
//   return res.json();
// }

export async function updateDispatchStatus(
  orderId: number,
  dispatchStatus: string,
  token: string
) {
  const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/vendor/orders/${orderId}/dispatch`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dispatchStatus }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update dispatch status');
  }

  return res.json();
}
