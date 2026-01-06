import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// AUTHENTICATION
// ============================================================================

// Sign Up
app.post('/make-server-139861b6/auth/signup', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Get current user counter
    const counterKey = 'user_counter';
    const currentCounter = await kv.get(counterKey) || 0;
    const nextCounter = currentCounter + 1;
    const userId = String(nextCounter).padStart(5, '0');

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { 
        user_id: userId,
        role: 'user' 
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Update counter
    await kv.set(counterKey, nextCounter);

    // Create user data record
    const userData = {
      userId,
      authId: authData.user.id,
      email,
      role: 'user',
      balance: 0,
      stakedBalance: 0,
      totalRewards: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      stakes: [],
      todaysReward: 0,
      lastRewardUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userData);
    await kv.set(`authId:${authData.user.id}`, userId);

    return c.json({ 
      user: {
        id: userId,
        email,
        role: 'user',
      },
      session: authData.session 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Sign In
app.post('/make-server-139861b6/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get user ID from metadata or lookup
    let userId = data.user?.user_metadata?.user_id;
    
    if (!userId) {
      // Try to find by authId
      userId = await kv.get(`authId:${data.user.id}`);
      
      if (!userId) {
        return c.json({ error: 'User data not found' }, 404);
      }
    }

    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    return c.json({ 
      user: {
        id: userId,
        email: userData.email,
        role: userData.role,
      },
      session: data.session 
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Signin failed' }, 500);
  }
});

// Get Current User
app.get('/make-server-139861b6/auth/user', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let userId = user.user_metadata?.user_id;
    
    if (!userId) {
      userId = await kv.get(`authId:${user.id}`);
    }

    if (!userId) {
      return c.json({ error: 'User data not found' }, 404);
    }

    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    return c.json({ 
      user: {
        id: userId,
        email: userData.email,
        role: userData.role,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// Sign Out
app.post('/make-server-139861b6/auth/signout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      console.error('Signout error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return c.json({ error: 'Signout failed' }, 500);
  }
});

// ============================================================================
// USER DATA
// ============================================================================

app.get('/make-server-139861b6/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(userData);
  } catch (error) {
    console.error('Get user data error:', error);
    return c.json({ error: 'Failed to get user data' }, 500);
  }
});

app.put('/make-server-139861b6/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userData = await c.req.json();
    
    await kv.set(`user:${userId}`, userData);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update user data error:', error);
    return c.json({ error: 'Failed to update user data' }, 500);
  }
});

app.get('/make-server-139861b6/users', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    return c.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

// ============================================================================
// TOKEN PRICE
// ============================================================================

app.get('/make-server-139861b6/token-price', async (c) => {
  try {
    const tokenPrice = await kv.get('token_price') || {
      price: 0.5,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    };
    
    return c.json(tokenPrice);
  } catch (error) {
    console.error('Get token price error:', error);
    return c.json({ error: 'Failed to get token price' }, 500);
  }
});

app.put('/make-server-139861b6/token-price', async (c) => {
  try {
    const { price, updatedBy } = await c.req.json();
    
    const tokenPrice = {
      price,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    
    await kv.set('token_price', tokenPrice);
    
    return c.json({ success: true, tokenPrice });
  } catch (error) {
    console.error('Update token price error:', error);
    return c.json({ error: 'Failed to update token price' }, 500);
  }
});

// ============================================================================
// TRANSACTIONS
// ============================================================================

app.get('/make-server-139861b6/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const transactions = await kv.get(`transactions:${userId}`) || [];
    
    return c.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({ error: 'Failed to get transactions' }, 500);
  }
});

app.post('/make-server-139861b6/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const transaction = await c.req.json();
    
    const transactions = await kv.get(`transactions:${userId}`) || [];
    transactions.push(transaction);
    
    await kv.set(`transactions:${userId}`, transactions);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Add transaction error:', error);
    return c.json({ error: 'Failed to add transaction' }, 500);
  }
});

// ============================================================================
// REQUESTS
// ============================================================================

// Deposit Requests
app.get('/make-server-139861b6/requests/deposits', async (c) => {
  try {
    const requests = await kv.get('deposit_requests') || [];
    return c.json(requests);
  } catch (error) {
    console.error('Get deposit requests error:', error);
    return c.json({ error: 'Failed to get deposit requests' }, 500);
  }
});

app.post('/make-server-139861b6/requests/deposits', async (c) => {
  try {
    const request = await c.req.json();
    const requests = await kv.get('deposit_requests') || [];
    requests.push(request);
    await kv.set('deposit_requests', requests);
    return c.json({ success: true });
  } catch (error) {
    console.error('Add deposit request error:', error);
    return c.json({ error: 'Failed to add deposit request' }, 500);
  }
});

app.put('/make-server-139861b6/requests/deposits', async (c) => {
  try {
    const requests = await c.req.json();
    await kv.set('deposit_requests', requests);
    return c.json({ success: true });
  } catch (error) {
    console.error('Update deposit requests error:', error);
    return c.json({ error: 'Failed to update deposit requests' }, 500);
  }
});

// Withdrawal Requests
app.get('/make-server-139861b6/requests/withdrawals', async (c) => {
  try {
    const requests = await kv.get('withdrawal_requests') || [];
    return c.json(requests);
  } catch (error) {
    console.error('Get withdrawal requests error:', error);
    return c.json({ error: 'Failed to get withdrawal requests' }, 500);
  }
});

app.post('/make-server-139861b6/requests/withdrawals', async (c) => {
  try {
    const request = await c.req.json();
    const requests = await kv.get('withdrawal_requests') || [];
    requests.push(request);
    await kv.set('withdrawal_requests', requests);
    return c.json({ success: true });
  } catch (error) {
    console.error('Add withdrawal request error:', error);
    return c.json({ error: 'Failed to add withdrawal request' }, 500);
  }
});

app.put('/make-server-139861b6/requests/withdrawals', async (c) => {
  try {
    const requests = await c.req.json();
    await kv.set('withdrawal_requests', requests);
    return c.json({ success: true });
  } catch (error) {
    console.error('Update withdrawal requests error:', error);
    return c.json({ error: 'Failed to update withdrawal requests' }, 500);
  }
});

// Staking Requests
app.get('/make-server-139861b6/requests/staking', async (c) => {
  try {
    const requests = await kv.get('staking_requests') || [];
    return c.json(requests);
  } catch (error) {
    console.error('Get staking requests error:', error);
    return c.json({ error: 'Failed to get staking requests' }, 500);
  }
});

app.post('/make-server-139861b6/requests/staking', async (c) => {
  try {
    const request = await c.req.json();
    const requests = await kv.get('staking_requests') || [];
    requests.push(request);
    await kv.set('staking_requests', requests);
    return c.json({ success: true });
  } catch (error) {
    console.error('Add staking request error:', error);
    return c.json({ error: 'Failed to add staking request' }, 500);
  }
});

app.put('/make-server-139861b6/requests/staking', async (c) => {
  try {
    const requests = await c.req.json();
    await kv.set('staking_requests', requests);
    return c.json({ success: true });
  } catch (error) {
    console.error('Update staking requests error:', error);
    return c.json({ error: 'Failed to update staking requests' }, 500);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

app.post('/make-server-139861b6/init', async (c) => {
  try {
    // Check if already initialized
    const initialized = await kv.get('system_initialized');
    if (initialized) {
      return c.json({ message: 'Already initialized' });
    }

    // Create admin user
    const adminEmail = 'methruwan@gmail.com';
    const adminPassword = 'Methruwan@123200720';
    
    const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { 
        user_id: '00001',
        role: 'admin' 
      },
    });

    if (adminError && !adminError.message.includes('already registered')) {
      console.error('Admin creation error:', adminError);
      return c.json({ error: adminError.message }, 400);
    }

    // Set up admin user data
    const adminData = {
      userId: '00001',
      authId: adminAuth?.user?.id || 'admin_auth_id',
      email: adminEmail,
      role: 'admin',
      balance: 1000000,
      stakedBalance: 0,
      totalRewards: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      stakes: [],
      todaysReward: 0,
      lastRewardUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set('user:00001', adminData);
    if (adminAuth?.user?.id) {
      await kv.set(`authId:${adminAuth.user.id}`, '00001');
    }

    // Initialize user counter
    await kv.set('user_counter', 1);

    // Initialize token price
    await kv.set('token_price', {
      price: 0.5,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    });

    // Initialize empty request arrays
    await kv.set('deposit_requests', []);
    await kv.set('withdrawal_requests', []);
    await kv.set('staking_requests', []);

    // Mark as initialized
    await kv.set('system_initialized', true);

    return c.json({ success: true, message: 'System initialized successfully' });
  } catch (error) {
    console.error('Initialization error:', error);
    return c.json({ error: 'Failed to initialize system' }, 500);
  }
});

// Health check
app.get('/make-server-139861b6/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);