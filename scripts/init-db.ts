import { MongoClient } from 'mongodb';

// MongoDB connection string - replace <db_password> with your actual password
const MONGODB_URI = 'mongodb+srv://oura_token:<db_password>@cluster0.wnedo7d.mongodb.net/oura-staking?retryWrites=true&w=majority&appName=Cluster0';

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db('oura-staking');

    // Create collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created users collection');
    }

    if (!collectionNames.includes('deposits')) {
      await db.createCollection('deposits');
      console.log('✅ Created deposits collection');
    }

    if (!collectionNames.includes('withdrawals')) {
      await db.createCollection('withdrawals');
      console.log('✅ Created withdrawals collection');
    }

    if (!collectionNames.includes('staking')) {
      await db.createCollection('staking');
      console.log('✅ Created staking collection');
    }

    if (!collectionNames.includes('settings')) {
      await db.createCollection('settings');
      console.log('✅ Created settings collection');
    }

    // Create admin user
    const usersCollection = db.collection('users');
    const adminExists = await usersCollection.findOne({ userId: '00001' });

    if (!adminExists) {
      await usersCollection.insertOne({
        userId: '00001',
        email: 'methruwan@gmail.com',
        password: 'Methruwan@123200720',
        name: 'Admin',
        role: 'admin',
        balance: 0,
        createdAt: new Date().toISOString(),
      });
      console.log('✅ Created admin user');
      console.log('   Email: methruwan@gmail.com');
      console.log('   Password: Methruwan@123200720');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Initialize platform settings
    const settingsCollection = db.collection('settings');
    const settingsExist = await settingsCollection.findOne({ type: 'platform' });

    if (!settingsExist) {
      await settingsCollection.insertOne({
        type: 'platform',
        tokenPrice: 0.5,
        depositAddress: '0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC',
        withdrawalFee: 0.03,
        stakingPools: {
          30: { duration: 30, dailyRate: 0.004 },
          90: { duration: 90, dailyRate: 0.006 },
          180: { duration: 180, dailyRate: 0.008 },
          360: { duration: 360, dailyRate: 0.01 },
        },
        createdAt: new Date().toISOString(),
      });
      console.log('✅ Created platform settings');
      console.log('   Token Price: $0.50');
      console.log('   Deposit Address: 0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC');
    } else {
      console.log('ℹ️  Platform settings already exist');
    }

    // Create indexes for better performance
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ userId: 1 }, { unique: true });
    await db.collection('deposits').createIndex({ userId: 1 });
    await db.collection('withdrawals').createIndex({ userId: 1 });
    await db.collection('staking').createIndex({ userId: 1 });
    console.log('✅ Created database indexes');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Set MONGODB_URI in your .env file');
    console.log('2. Deploy to Netlify');
    console.log('3. Login with admin credentials\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

// Run the initialization
initializeDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
