# 🚀 Oura Staking Platform - Deployment Guide

## Overview
This guide will help you deploy the Oura Staking platform to Netlify with MongoDB Atlas as the database.

---

## 📋 Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **GitHub Account** (optional) - For automatic deployments

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### Create a MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Build a Database"
3. Choose **FREE M0 cluster**
4. Select a cloud provider and region (choose closest to your users)
5. Click "Create Cluster"

### Configure Database Access

1. In your Atlas dashboard, click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Create a username and password
   - ⚠️ **Save these credentials** - you'll need them later
4. Set permissions to **Read and write to any database**
5. Click **Add User**

### Configure Network Access

1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
   - This adds `0.0.0.0/0` to the whitelist
4. Click **Confirm**

### Get Your Connection String

1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual credentials

---

## 📦 Step 2: Deploy to Netlify

### Option A: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Build your project**:
   ```bash
   npm run build
   ```

4. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```

5. **Follow the prompts**:
   - Create a new site or link to existing
   - Set publish directory to: `dist`

### Option B: Deploy via Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**

---

## 🔐 Step 3: Configure Environment Variables

1. In Netlify Dashboard, go to **Site settings** → **Environment variables**
2. Add the following variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/oura-staking?retryWrites=true&w=majority
NODE_ENV=production
```

3. Click **Save**
4. **Trigger a new deployment** to apply environment variables

---

## 🔧 Step 4: Netlify Functions Configuration

The platform uses Netlify serverless functions for the backend API. The functions are automatically deployed from the `/netlify/functions/` directory.

### Functions Overview:
- All API endpoints are serverless functions
- They connect to MongoDB Atlas
- No additional setup required - Netlify handles everything

---

## ✅ Step 5: Verify Deployment

1. Visit your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
2. Test the following:
   - ✅ Login with admin credentials: `methruwan@gmail.com` / `Methruwan@123200720`
   - ✅ Create a new user account
   - ✅ Submit a deposit request
   - ✅ Admin: Approve deposit requests
   - ✅ Check that data persists after refresh

---

## 🔄 Continuous Deployment

### Auto-deploy from Git

1. Push changes to your Git repository:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. Netlify will automatically:
   - Build your project
   - Deploy to production
   - Update serverless functions

---

## 🌍 Custom Domain (Optional)

1. In Netlify Dashboard → **Domain settings**
2. Click **Add custom domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run build
```

Check build logs in Netlify dashboard for specific errors.

### Database Connection Issues

1. Verify MongoDB connection string in environment variables
2. Check MongoDB Atlas Network Access allows Netlify IPs
3. Ensure database user credentials are correct

### Functions Not Working

1. Check function logs in Netlify dashboard
2. Verify environment variables are set
3. Re-deploy to apply changes

### Data Not Persisting

1. Check browser console for errors
2. Verify API calls are reaching serverless functions
3. Check MongoDB Atlas cluster is active

---

## 📊 Monitoring

### Netlify Analytics
- Go to **Analytics** in Netlify dashboard
- Track visitors, bandwidth, and performance

### MongoDB Atlas Monitoring
- Go to **Metrics** in Atlas dashboard
- Monitor database operations, connections, and storage

---

## 🔒 Security Checklist

- ✅ MongoDB connection string stored in environment variables
- ✅ No sensitive data in source code
- ✅ HTTPS enabled on Netlify
- ✅ MongoDB Network Access configured
- ✅ Strong admin password set

---

## 📱 Mobile Optimization

The platform is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

Test on different devices to ensure optimal experience.

---

## 🆘 Support

If you encounter issues:

1. Check Netlify build logs
2. Check MongoDB Atlas logs
3. Check browser console for frontend errors
4. Review function logs in Netlify dashboard

---

## 🎉 Success!

Your Oura Staking platform is now live! 🚀

**Next Steps:**
1. Share your site URL with users
2. Monitor user activity in MongoDB Atlas
3. Set up custom domain (optional)
4. Enable backups in MongoDB Atlas

---

**Deployed Site Structure:**
```
https://your-site.netlify.app
├── /                    # Login/Signup page
├── /dashboard           # User dashboard
├── /wallet              # Wallet management
├── /staking             # Staking pools
└── /admin               # Admin panel
```

**API Endpoints (Serverless Functions):**
```
/.netlify/functions/auth
/.netlify/functions/users
/.netlify/functions/deposits
/.netlify/functions/withdrawals
/.netlify/functions/staking
/.netlify/functions/admin
```

---

Made with ❤️ for decentralized finance
