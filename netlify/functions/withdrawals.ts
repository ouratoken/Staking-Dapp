import type { Handler } from '@netlify/functions';
import { getDatabase, getCORSHeaders } from './db';

const WITHDRAWAL_FEE = 0.03; // 3%

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
    const withdrawalsCollection = db.collection('withdrawals');
    const usersCollection = db.collection('users');

    // GET - Get all withdrawals for a user or all withdrawals (admin)
    if (event.httpMethod === 'GET') {
      const userId = event.queryStringParameters?.userId;
      const isAdmin = event.queryStringParameters?.isAdmin === 'true';

      let withdrawals;
      if (isAdmin) {
        withdrawals = await withdrawalsCollection.find().sort({ createdAt: -1 }).toArray();
      } else if (userId) {
        withdrawals = await withdrawalsCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
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
        body: JSON.stringify(withdrawals),
      };
    }

    // POST - Create new withdrawal request
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { userId, amount, address } = body;

      // Check user balance
      const user = await usersCollection.findOne({ userId });

      if (!user || user.balance < amount) {
        return {
          statusCode: 400,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Insufficient balance' }),
        };
      }

      const fee = parseFloat(amount) * WITHDRAWAL_FEE;
      const netAmount = parseFloat(amount) - fee;

      const newWithdrawal = {
        id: Date.now().toString(),
        userId,
        amount: parseFloat(amount),
        fee,
        netAmount,
        address,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await withdrawalsCollection.insertOne(newWithdrawal);

      return {
        statusCode: 201,
        headers: getCORSHeaders(),
        body: JSON.stringify(newWithdrawal),
      };
    }

    // PUT - Update withdrawal status (admin only)
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { id, status } = body;

      const withdrawal = await withdrawalsCollection.findOne({ id });

      if (!withdrawal) {
        return {
          statusCode: 404,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Withdrawal not found' }),
        };
      }

      // Update withdrawal status
      await withdrawalsCollection.updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );

      // If approved, deduct from user balance
      if (status === 'approved') {
        await usersCollection.updateOne(
          { userId: withdrawal.userId },
          { $inc: { balance: -withdrawal.amount } }
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
    console.error('Withdrawals error:', error);
    return {
      statusCode: 500,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
