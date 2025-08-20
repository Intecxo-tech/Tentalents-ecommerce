import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Step 1: Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
      }

      const token = authHeader.split(' ')[1];

      // Step 2: Decode token to get userId
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.userId;

      // Step 3: Extract the order data
      const { data } = req.body;

      const orderApiUrl = process.env.NEXT_PUBLIC_ORDER_API_LINK;
      if (!orderApiUrl) {
        return res.status(500).json({ error: 'API URL not defined in env' });
      }

      // Step 4: Send order to external order service
      const apiResponse = await fetch(`https://order-service-faxh.onrender.com/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, data }), // ✅ userId from token
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to place the order with external service');
      }

      const order = await apiResponse.json();
      return res.status(201).json(order);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Failed to place order' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}




