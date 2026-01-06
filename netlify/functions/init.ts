import { Handler } from '@netlify/functions';
import { connectToDatabase } from './db';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const settingsCollection = db.collection('settings');

    // Check if admin already exists
    const adminExists = await usersCollection.findOne({ userId: '00001' });

    if (!adminExists) {
      // Create admin user
      const adminUser = {
        userId: '00001',
        email: 'methruwan@gmail.com',
        password: 'Methruwan@123200720',
        name: 'Admin',
        role: 'admin',
        balance: 0,
        stakedBalance: 0,
        stakes: [],
        transactions: [],
        createdAt: new Date().toISOString(),
      };

      await usersCollection.insertOne(adminUser);
      console.log('Admin user created');
    }

    // Check if settings exist
    const settingsExist = await settingsCollection.findOne({ type: 'platform' });

    if (!settingsExist) {
      // Create default settings
      const defaultSettings = {
        type: 'platform',
        tokenPrice: {
          price: 0.5,
          updatedAt: new Date().toISOString(),
        },
      };

      await settingsCollection.insertOne(defaultSettings);
      console.log('Default settings created');
    }

    // Create indexes for better performance
    await usersCollection.createIndex({ userId: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await settingsCollection.createIndex({ type: 1 }, { unique: true });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database initialized successfully',
      }),
    };
  } catch (error: any) {
    console.error('Init error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Initialization failed' }),
    };
  }
};
