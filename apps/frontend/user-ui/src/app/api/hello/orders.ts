import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Missing or invalid token');
        return res.status(401).json({ error: 'Missing or invalid token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.userId;
      console.log('✅ Decoded userId from token:', userId);

      const { data } = req.body;
      console.log('📦 Order data received:', JSON.stringify(data, null, 2));

      const orderApiUrl = process.env.NEXT_PUBLIC_ORDER_API_LINK;
      if (!orderApiUrl) {
        console.log('❌ API URL not set');
        return res.status(500).json({ error: 'API URL not defined in env' });
      }

      const apiResponse = await fetch(`https://order-service-322f.onrender.com/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, data }),
      });

      const text = await apiResponse.text(); // use text() to log raw response
      console.log('🧾 Response from order service:', text);

      if (!apiResponse.ok) {
        console.log('❌ Order service returned error');
        throw new Error('Failed to place the order with external service');
      }

      const order = JSON.parse(text);
      return res.status(201).json(order);
    } catch (error: any) {
      console.error('🚨 Error placing order:', error.message);
      return res.status(500).json({ error: error.message || 'Failed to place order' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
