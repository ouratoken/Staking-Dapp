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
    const usersCollection = db.collection('users');
    const settingsCollection = db.collection('settings');

    // GET - Get all users or settings
    if (event.httpMethod === 'GET') {
      const type = event.queryStringParameters?.type;

      if (type === 'users') {
        const users = await usersCollection.find().toArray();
        return {
          statusCode: 200,
          headers: getCORSHeaders(),
          body: JSON.stringify(users),
        };
      }

      if (type === 'settings') {
        const settings = await settingsCollection.findOne({ type: 'platform' });
        return {
          statusCode: 200,
          headers: getCORSHeaders(),
          body: JSON.stringify(settings || { tokenPrice: 0.5 }),
        };
      }

      return {
        statusCode: 400,
        headers: getCORSHeaders(),
        body: JSON.stringify({ error: 'Missing type parameter' }),
      };
    }

    // POST - Credit user
    if (event.httpMethod === 'POST' && event.path.includes('/credit')) {
      const body = JSON.parse(event.body || '{}');
      const { userId, amount } = body;

      await usersCollection.updateOne(
        { userId },
        { $inc: { balance: parseFloat(amount) } }
      );

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify({ success: true }),
      };
    }

    // PUT - Update token price
    if (event.httpMethod === 'PUT' && event.path.includes('/token-price')) {
      const body = JSON.parse(event.body || '{}');
      const { price } = body;

      await settingsCollection.updateOne(
        { type: 'platform' },
        { $set: { tokenPrice: parseFloat(price), updatedAt: new Date().toISOString() } },
        { upsert: true }
      );

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify({ success: true }),
      };
    }

    // GET - Get statistics
    if (event.httpMethod === 'GET' && event.path.includes('/stats')) {
      const totalUsers = await usersCollection.countDocuments({ role: 'user' });
      
      const users = await usersCollection.find().toArray();
      const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);

      const depositsCollection = db.collection('deposits');
      const pendingDeposits = await depositsCollection.countDocuments({ status: 'pending' });

      const withdrawalsCollection = db.collection('withdrawals');
      const pendingWithdrawals = await withdrawalsCollection.countDocuments({ status: 'pending' });

      const stakingCollection = db.collection('staking');
      const activeStaking = await stakingCollection.countDocuments({ status: 'active' });

      const stats = {
        totalUsers,
        totalBalance,
        pendingDeposits,
        pendingWithdrawals,
        activeStaking,
      };

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify(stats),
      };
    }

    return {
      statusCode: 405,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Admin error:', error);
    return {
      statusCode: 500,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
