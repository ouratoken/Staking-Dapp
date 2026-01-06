# ⚡ Oura Staking - Quick Start Guide

## 🎯 5-Minute Deployment

### Prerequisites
- MongoDB Atlas account
- Netlify account
- Your MongoDB connection string ready

---

## 🚀 Step-by-Step (5 Minutes)

### 1️⃣ Get Your MongoDB Password (1 min)

Your connection string:
```
mongodb+srv://oura_token:<db_password>@cluster0.wnedo7d.mongodb.net/
```

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Database Access**
3. Get/reset password for user `oura_token`
4. **SAVE THIS PASSWORD** 📝

---

### 2️⃣ Initialize Database (1 min)

1. Create `.env` file:
   ```bash
   MONGODB_URI=mongodb+srv://oura_token:YOUR_PASSWORD@cluster0.wnedo7d.mongodb.net/oura-staking?retryWrites=true&w=majority&appName=Cluster0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize database:
   ```bash
   npm run init-db
   ```

You should see:
```
✅ Connected to MongoDB Atlas
✅ Created users collection
✅ Created deposits collection
✅ Created withdrawals collection
✅ Created staking collection
✅ Created settings collection
✅ Created admin user
✅ Created platform settings
🎉 Database initialization completed!
```

---

### 3️⃣ Deploy to Netlify (2 mins)

**Option A: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Option B: Netlify Dashboard**
1. Go to [app.netlify.com](https://app.netlify.com)
2. **New site from Git**
3. Connect your repository
4. Build: `npm run build`
5. Publish: `dist`

---

### 4️⃣ Configure Environment (1 min)

In Netlify Dashboard:
1. **Site settings** → **Environment variables**
2. Add variable:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://oura_token:YOUR_PASSWORD@cluster0.wnedo7d.mongodb.net/oura-staking?retryWrites=true&w=majority&appName=Cluster0`
3. **Save**
4. **Trigger deploy** (redeploy site)

---

## ✅ Verify It Works

### Test Login (Admin):
- Go to your Netlify URL
- Email: `methruwan@gmail.com`
- Password: `Methruwan@123200720`
- ✅ Should see admin dashboard

### Test Signup (User):
- Click "Sign Up"
- Create new account
- ✅ Should get User ID: 00002
- ✅ Should see user dashboard

### Test Deposit:
- Go to Wallet
- See deposit address: `0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC`
- Submit deposit request
- ✅ Should appear in admin panel

---

## 🎉 You're Live!

Your site is now deployed at:
```
https://YOUR-SITE-NAME.netlify.app
```

---

## 📋 What Was Created

### In MongoDB Atlas:
- Database: `oura-staking`
- Collections: users, deposits, withdrawals, staking, settings
- Admin user with ID: 00001
- Token price set to $0.50

### On Netlify:
- Frontend deployed
- 5 Serverless functions:
  - `/auth` - Login/Signup
  - `/deposits` - Deposit management
  - `/withdrawals` - Withdrawal management
  - `/staking` - Staking operations
  - `/admin` - Admin functions

---

## 🔧 Common Issues

### Build Failed?
```bash
# Test locally first
npm run build
```

### Functions Not Working?
- Check environment variables in Netlify
- Verify MongoDB password is correct
- Check function logs in Netlify

### Can't Login?
- Run `npm run init-db` again
- Check MongoDB Atlas is active
- Verify connection string

---

## 📚 Full Documentation

- **README.md** - Complete overview
- **DEPLOYMENT.md** - Detailed deployment guide
- **MONGODB-SETUP.md** - Database setup details
- **DEPLOYMENT-CHECKLIST.md** - Full checklist

---

## 🎯 Next Steps

1. ✅ Change admin password (recommended)
2. ✅ Set up MongoDB backups
3. ✅ Add custom domain (optional)
4. ✅ Test all features
5. ✅ Share with users!

---

## 📞 Need Help?

Check the troubleshooting sections in:
- `MONGODB-SETUP.md`
- `DEPLOYMENT.md`

---

**That's it! You're live in 5 minutes! 🚀**

Happy Staking! 🎉
