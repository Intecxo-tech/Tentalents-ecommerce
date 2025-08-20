import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, data } = req.body; // Changed buyerId to userId

      // Fetch the order service API from the environment variable
      const orderApiUrl =`https://order-service-faxh.onrender.com`; // Fetch from environment variable

      if (!orderApiUrl) {
        return res.status(500).json({ error: 'API URL is not defined in the environment variables' });
      }

      // Send the POST request to the external order service
      const apiResponse = await fetch(`https://order-service-faxh.onrender.com/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, data }), // Changed buyerId to userId
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to place the order with external service');
      }

      // Get the response from the external service
      const order = await apiResponse.json();

      // Return the order data in the response
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to place order' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}



