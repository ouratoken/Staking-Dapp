import type { Handler } from '@netlify/functions';
import { getDatabase, getCORSHeaders } from './db';

const STAKING_POOLS = {
  '30': { duration: 30, dailyRate: 0.004 },
  '90': { duration: 90, dailyRate: 0.006 },
  '180': { duration: 180, dailyRate: 0.008 },
  '360': { duration: 360, dailyRate: 0.01 },
};

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
    const stakingCollection = db.collection('staking');
    const usersCollection = db.collection('users');

    // GET - Get all staking positions
    if (event.httpMethod === 'GET') {
      const userId = event.queryStringParameters?.userId;
      const isAdmin = event.queryStringParameters?.isAdmin === 'true';

      let stakingPositions;
      if (isAdmin) {
        stakingPositions = await stakingCollection.find().sort({ createdAt: -1 }).toArray();
      } else if (userId) {
        stakingPositions = await stakingCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
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
        body: JSON.stringify(stakingPositions),
      };
    }

    // POST - Create new staking position
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { userId, amount, pool } = body;

      // Check user balance
      const user = await usersCollection.findOne({ userId });

      if (!user || user.balance < amount) {
        return {
          statusCode: 400,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Insufficient balance' }),
        };
      }

      const poolConfig = STAKING_POOLS[pool as keyof typeof STAKING_POOLS];

      if (!poolConfig) {
        return {
          statusCode: 400,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Invalid staking pool' }),
        };
      }

      const newStaking = {
        id: Date.now().toString(),
        userId,
        amount: parseFloat(amount),
        pool: parseInt(pool),
        dailyRate: poolConfig.dailyRate,
        status: 'pending',
        progress: 0,
        earnedRewards: 0,
        createdAt: new Date().toISOString(),
      };

      await stakingCollection.insertOne(newStaking);

      return {
        statusCode: 201,
        headers: getCORSHeaders(),
        body: JSON.stringify(newStaking),
      };
    }

    // PUT - Update staking position
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { id, action, status } = body;

      const position = await stakingCollection.findOne({ id });

      if (!position) {
        return {
          statusCode: 404,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Staking position not found' }),
        };
      }

      // Approve staking
      if (action === 'approve') {
        await stakingCollection.updateOne(
          { id },
          { 
            $set: { 
              status: 'active',
              startDate: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            } 
          }
        );

        // Deduct from user balance
        await usersCollection.updateOne(
          { userId: position.userId },
          { $inc: { balance: -position.amount } }
        );
      }

      // Reject staking
      if (action === 'reject') {
        await stakingCollection.updateOne(
          { id },
          { $set: { status: 'rejected', updatedAt: new Date().toISOString() } }
        );
      }

      // Unstake
      if (action === 'unstake') {
        await stakingCollection.updateOne(
          { id },
          { $set: { status: 'completed', updatedAt: new Date().toISOString() } }
        );

        // Return staked amount + earned rewards to user
        const totalReturn = position.amount + (position.earnedRewards || 0);
        await usersCollection.updateOne(
          { userId: position.userId },
          { $inc: { balance: totalReturn } }
        );
      }

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify({ success: true }),
      };
    }

    // DELETE - Distribute rewards (admin only)
    if (event.httpMethod === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const { id, rewardAmount } = body;

      const position = await stakingCollection.findOne({ id });

      if (!position || position.status !== 'active') {
        return {
          statusCode: 400,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Invalid staking position' }),
        };
      }

      const newEarnedRewards = (position.earnedRewards || 0) + parseFloat(rewardAmount);
      const poolConfig = STAKING_POOLS[position.pool.toString() as keyof typeof STAKING_POOLS];
      const totalPossibleRewards = position.amount * poolConfig.dailyRate * poolConfig.duration;
      const newProgress = Math.min((newEarnedRewards / totalPossibleRewards) * 100, 100);

      await stakingCollection.updateOne(
        { id },
        { 
          $set: { 
            earnedRewards: newEarnedRewards,
            progress: newProgress,
            updatedAt: new Date().toISOString() 
          } 
        }
      );

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
    console.error('Staking error:', error);
    return {
      statusCode: 500,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
