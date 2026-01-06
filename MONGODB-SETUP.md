# 🗄️ MongoDB Atlas Setup Guide for Oura Staking

## 📋 Overview

You now have:
- ✅ MongoDB driver installed
- ✅ Your MongoDB Atlas cluster created
- ✅ Connection string ready: `mongodb+srv://oura_token:<db_password>@cluster0.wnedo7d.mongodb.net/`
- ✅ Netlify serverless functions created
- ✅ Database initialization script ready

---

## 🚀 Quick Setup Steps

### Step 1: Get Your MongoDB Password

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Click **Database Access** (left sidebar)
3. Find your user `oura_token`
4. Note your password (or reset it if you forgot)
   - Click **EDIT** on the user
   - Click **Edit Password**
   - Choose **Autogenerate Secure Password** or set your own
   - **COPY AND SAVE** the password

### Step 2: Set Up Environment Variables

#### For Local Development:

1. Create a file named `.env` in your project root:
   ```bash
   MONGODB_URI=mongodb+srv://oura_token:YOUR_ACTUAL_PASSWORD@cluster0.wnedo7d.mongodb.net/oura-staking?retryWrites=true&w=majority&appName=Cluster0
   NODE_ENV=development
   ```

2. Replace `YOUR_ACTUAL_PASSWORD` with your actual MongoDB password

#### For Netlify Deployment:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://oura_token:YOUR_ACTUAL_PASSWORD@cluster0.wnedo7d.mongodb.net/oura-staking?retryWrites=true&w=majority&appName=Cluster0`
6. Click **Add variable**

### Step 3: Initialize Your Database

Run this script to create collections and admin user:

```bash
npm run init-db
```

This will:
- ✅ Create all required collections (users, deposits, withdrawals, staking, settings)
- ✅ Create admin user (methruwan@gmail.com / Methruwan@123200720)
- ✅ Set up platform settings (token price $0.50, deposit address, etc.)
- ✅ Create database indexes for performance

### Step 4: Verify Database Setup

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Click **Browse Collections**
3. You should see:
   - Database: `oura-staking`
   - Collections:
     - `users` (with 1 admin user)
     - `deposits`
     - `withdrawals`
     - `staking`
     - `settings`

---

## 🌐 Netlify Functions

Your serverless functions are ready at `/netlify/functions/`:

### Available Endpoints:

#### Authentication
```
POST /.netlify/functions/auth/login
POST /.netlify/functions/auth/signup
```

#### Deposits
```
GET  /.netlify/functions/deposits?userId={id}&isAdmin={true/false}
POST /.netlify/functions/deposits
PUT  /.netlify/functions/deposits
```

#### Withdrawals
```
GET  /.netlify/functions/withdrawals?userId={id}&isAdmin={true/false}
POST /.netlify/functions/withdrawals
PUT  /.netlify/functions/withdrawals
```

#### Staking
```
GET    /.netlify/functions/staking?userId={id}&isAdmin={true/false}
POST   /.netlify/functions/staking
PUT    /.netlify/functions/staking
DELETE /.netlify/functions/staking (distribute rewards)
```

#### Admin
```
GET /.netlify/functions/admin?type=users
GET /.netlify/functions/admin?type=settings
GET /.netlify/functions/admin/stats
POST /.netlify/functions/admin/credit
PUT /.netlify/functions/admin/token-price
```

---

## 📝 Database Schema

### Users Collection
```typescript
{
  userId: "00001",           // Sequential: 00001, 00002, etc.
  email: "user@example.com",
  password: "hashedPassword",
  name: "User Name",
  role: "user" | "admin",
  balance: 100.50,           // OR Tokens
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Deposits Collection
```typescript
{
  id: "1234567890",
  userId: "00002",
  amount: 100,
  txId: "0x1234...",
  email: "user@example.com",
  userType: "buyer" | "merchant" | "introducer",
  status: "pending" | "approved" | "rejected",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Withdrawals Collection
```typescript
{
  id: "1234567890",
  userId: "00002",
  amount: 100,
  fee: 3,                    // 3% = 3 tokens
  netAmount: 97,             // amount - fee
  address: "0xPolygonAddress...",
  status: "pending" | "approved" | "rejected",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Staking Collection
```typescript
{
  id: "1234567890",
  userId: "00002",
  amount: 100,
  pool: 30 | 90 | 180 | 360,
  dailyRate: 0.004,          // 0.4% for 30-day pool
  status: "pending" | "active" | "completed" | "rejected",
  progress: 50,              // 0-100%
  earnedRewards: 12.5,
  createdAt: "2024-01-01T00:00:00.000Z",
  startDate: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Settings Collection
```typescript
{
  type: "platform",
  tokenPrice: 0.5,
  depositAddress: "0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC",
  withdrawalFee: 0.03,
  stakingPools: {
    30: { duration: 30, dailyRate: 0.004 },
    90: { duration: 90, dailyRate: 0.006 },
    180: { duration: 180, dailyRate: 0.008 },
    360: { duration: 360, dailyRate: 0.01 }
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use environment variables for MongoDB URI
- Never commit `.env` file to Git
- Use strong passwords for MongoDB users
- Enable MongoDB Atlas IP whitelist in production
- Regularly backup your database
- Monitor database access logs

### ❌ DON'T:
- Don't hardcode MongoDB URI in code
- Don't expose database credentials
- Don't allow public access without authentication
- Don't skip input validation

---

## 🧪 Testing Your Setup

### 1. Test Database Connection

Create a test file `test-db.ts`:
```typescript
import { MongoClient } from 'mongodb';

const uri = 'YOUR_MONGODB_URI_HERE';

async function testConnection() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    const db = client.db('oura-staking');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await client.close();
  }
}

testConnection();
```

Run: `npx tsx test-db.ts`

### 2. Test Admin Login

After initializing the database, try logging in:
- Email: `methruwan@gmail.com`
- Password: `Methruwan@123200720`

---

## 📊 MongoDB Atlas Dashboard

### Monitor Your Database:

1. **Metrics** - View database operations, connections, network usage
2. **Performance Advisor** - Get optimization suggestions
3. **Real-time** - See live database operations
4. **Alerts** - Set up email alerts for issues

### Enable Backups (Recommended):

1. Go to **Backup** tab
2. Click **Enable Cloud Backup**
3. Configure backup schedule
4. Set retention period

---

## 🚀 Deploy to Netlify

### Using Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Using GitHub:

1. Push code to GitHub
2. Connect repository in Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy!

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: Can't connect to MongoDB
**Solution**:
1. Check MongoDB password is correct
2. Verify Network Access allows your IP (or 0.0.0.0/0)
3. Confirm connection string format is correct
4. Check MongoDB Atlas cluster is active

### Function Errors

**Problem**: Netlify functions not working
**Solution**:
1. Check environment variables are set in Netlify
2. View function logs in Netlify dashboard
3. Verify MongoDB connection in logs
4. Test locally first with `netlify dev`

### Database Not Found

**Problem**: Collections not showing up
**Solution**:
1. Run `npm run init-db` to create collections
2. Check you're connected to correct cluster
3. Verify database name is `oura-staking`

---

## 📞 Next Steps

1. ✅ Set up MongoDB password
2. ✅ Update environment variables
3. ✅ Run database initialization script
4. ✅ Test database connection
5. ✅ Deploy to Netlify
6. ✅ Test all features
7. ✅ Enable database backups
8. ✅ Set up monitoring
9. ✅ Go live! 🎉

---

## 🎉 Success!

Your Oura Staking platform is now connected to MongoDB Atlas and ready for production deployment on Netlify!

**Your Setup:**
- Database: `oura-staking` on MongoDB Atlas
- Cluster: `cluster0.wnedo7d.mongodb.net`
- User: `oura_token`
- Serverless Functions: Ready on Netlify
- Admin Login: methruwan@gmail.com / Methruwan@123200720

---

**Happy Deploying! 🚀**
