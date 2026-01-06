import { Handler } from '@netlify/functions';
import { connectToDatabase } from './db';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    if (event.httpMethod === 'GET') {
      const { userId } = event.queryStringParameters || {};

      if (userId) {
        // Get specific user
        const user = await usersCollection.findOne({ userId });
        
        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'User not found' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(user),
        };
      } else {
        // Get all users (admin only)
        const users = await usersCollection.find({}).toArray();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(users),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      const { action, userId, amount, field, value } = JSON.parse(event.body || '{}');

      if (action === 'update') {
        const updateData: any = {};
        updateData[field] = value;

        await usersCollection.updateOne(
          { userId },
          { $set: updateData }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      if (action === 'creditBalance') {
        await usersCollection.updateOne(
          { userId },
          { $inc: { balance: amount } }
        );

        // Add transaction
        const transaction = {
          id: `tx-${Date.now()}`,
          type: 'admin_credit',
          amount,
          status: 'completed',
          date: new Date().toISOString(),
          description: 'Admin credit',
        };

        await usersCollection.updateOne(
          { userId },
          { $push: { transactions: transaction } }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  } catch (error: any) {
    console.error('Users error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
