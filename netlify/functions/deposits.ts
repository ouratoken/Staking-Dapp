import type { Handler } from '@netlify/functions';
import { getDatabase, getCORSHeaders } from './db';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCORSHeaders(),
      body: '',
    };
  }

  try {
    const db = await getDatabase();
    const depositsCollection = db.collection('deposits');
    const usersCollection = db.collection('users');

    // GET - Get all deposits for a user or all deposits (admin)
    if (event.httpMethod === 'GET') {
      const userId = event.queryStringParameters?.userId;
      const isAdmin = event.queryStringParameters?.isAdmin === 'true';

      let deposits;
      if (isAdmin) {
        deposits = await depositsCollection.find().sort({ createdAt: -1 }).toArray();
      } else if (userId) {
        deposits = await depositsCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
      } else {
        return {
          statusCode: 400,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Missing userId parameter' }),
        };
      }

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify(deposits),
      };
    }

    // POST - Create new deposit request
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { userId, amount, txId, email, userType } = body;

      const newDeposit = {
        id: Date.now().toString(),
        userId,
        amount: parseFloat(amount),
        txId,
        email,
        userType: userType || 'buyer',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await depositsCollection.insertOne(newDeposit);

      return {
        statusCode: 201,
        headers: getCORSHeaders(),
        body: JSON.stringify(newDeposit),
      };
    }

    // PUT - Update deposit status (admin only)
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { id, status } = body;

      const deposit = await depositsCollection.findOne({ id });

      if (!deposit) {
        return {
          statusCode: 404,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Deposit not found' }),
        };
      }

      // Update deposit status
      await depositsCollection.updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );

      // If approved, update user balance
      if (status === 'approved') {
        await usersCollection.updateOne(
          { userId: deposit.userId },
          { $inc: { balance: deposit.amount } }
        );
      }

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Deposits error:', error);
    return {
      statusCode: 500,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
