import type { Handler } from '@netlify/functions';
import { getDatabase, getCORSHeaders } from './db';

const handler: Handler = async (event) => {
  // Handle OPTIONS request for CORS
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
    const body = JSON.parse(event.body || '{}');

    // Login
    if (event.path.includes('/login')) {
      const { email, password } = body;
      
      const user = await usersCollection.findOne({ email, password });
      
      if (!user) {
        return {
          statusCode: 401,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Invalid credentials' }),
        };
      }

      return {
        statusCode: 200,
        headers: getCORSHeaders(),
        body: JSON.stringify({ user }),
      };
    }

    // Signup
    if (event.path.includes('/signup')) {
      const { email, password, name } = body;
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      
      if (existingUser) {
        return {
          statusCode: 400,
          headers: getCORSHeaders(),
          body: JSON.stringify({ error: 'Email already registered' }),
        };
      }

      // Get the next user ID
      const lastUser = await usersCollection
        .find()
        .sort({ userId: -1 })
        .limit(1)
        .toArray();
      
      const nextId = lastUser.length > 0 
        ? parseInt(lastUser[0].userId) + 1 
        : 2; // Start from 2 (1 is admin)

      const userId = nextId.toString().padStart(5, '0');

      const newUser = {
        userId,
        email,
        password,
        name,
        role: 'user',
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      await usersCollection.insertOne(newUser);

      return {
        statusCode: 201,
        headers: getCORSHeaders(),
        body: JSON.stringify({ user: newUser }),
      };
    }

    return {
      statusCode: 404,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
