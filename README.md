# 🌟 Oura Staking Platform

A complete token staking platform with user authentication, admin management, and a comprehensive deposit/withdrawal request system.

![Platform Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![React](https://img.shields.io/badge/react-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/typescript-ready-blue)
![Tailwind](https://img.shields.io/badge/tailwind-4.1.12-blueviolet)

---

## ✨ Features

### 🔐 Authentication & Security
- Secure user authentication system
- Role-based access control (Admin/User)
- Admin credentials: `methruwan@gmail.com` / `Methruwan@123200720`
- Password validation with strong security requirements
- Email validation
- Sequential user IDs (00001, 00002, etc.)

### 💰 Token Management
- **OR (Oura) Token** system
- Real-time USD value conversion
- Admin-controlled token price (starting at $0.50)
- Display token amounts and USD equivalents

### 🏦 Deposit System
- Polygon (POL) network deposit address
- Deposit request workflow with admin approval
- TXID verification
- Email confirmation
- **User Type Selection**: Introducer / Merchant / Buyer
- View deposit address in wallet section

### 💸 Withdrawal System
- 3% withdrawal fee
- Polygon network address support
- Admin approval required
- Net amount calculation
- Withdrawal request tracking

### 📊 Staking Pools
- **30-Day Pool**: 0.4% daily rewards
- **90-Day Pool**: 0.6% daily rewards
- **180-Day Pool**: 0.8% daily rewards
- **360-Day Pool**: 1% daily rewards
- Progress bars based on admin-distributed rewards
- Admin-controlled reward distribution

### 👨‍💼 Admin Panel
- Comprehensive dashboard with statistics
- Deposit request management
- Withdrawal request management
- Staking request approval
- Manual token price updates
- Credit users directly
- Distribute staking rewards
- View all user accounts
- Monitor platform activity

### 🎨 UI/UX
- Beautiful dark theme
- Purple/blue cloud background on login
- Responsive design (mobile, tablet, desktop)
- Toast notifications for all actions
- Real-time updates
- Intuitive navigation

### 🔔 Notifications
Toast notifications for:
- ✅ Login successful
- ✅ Signup successful
- ✅ Deposit request submitted
- ✅ Withdrawal request submitted
- ✅ Staking request submitted
- ✅ Unstaking request submitted
- ✅ Address copied to clipboard
- ✅ Admin actions (approve/reject)
- ✅ Token price updates
- ✅ All error messages

---

## 🏗️ Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool
- **Sonner** - Toast notifications
- **Lucide React** - Icon system
- **React Hook Form** - Form management

### Backend Options

#### Option 1: LocalStorage (Current - Figma Make)
- Client-side data persistence
- No backend required
- Perfect for prototyping
- Automatic initialization

#### Option 2: MongoDB Atlas + Netlify (Production Ready)
- Cloud MongoDB database
- Netlify serverless functions
- Scalable architecture
- Production-grade security
- See `DEPLOYMENT.md` for setup

---

## 📂 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/          # React components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Wallet.tsx
│   │   │   ├── Staking.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── lib/                 # Utilities & logic
│   │   │   ├── api.ts          # API functions
│   │   │   ├── types.ts        # TypeScript types
│   │   │   └── utils.ts        # Helper functions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   └── styles/
│       ├── theme.css           # Theme variables
│       └── fonts.css           # Font imports
├── netlify/
│   └── functions/              # Serverless functions (for MongoDB deployment)
├── public/                     # Static assets
├── package.json                # Dependencies
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) MongoDB Atlas account for production

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for detailed deployment instructions including:
- MongoDB Atlas setup
- Netlify configuration
- Environment variables
- Custom domain setup
- Troubleshooting

---

## 🎯 Usage

### User Flow

1. **Sign Up / Login**
   - Create account with email and password
   - Or login with existing credentials

2. **Deposit OR Tokens**
   - View deposit address in Wallet section
   - Copy POL network address: `0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC`
   - Send OR tokens to the address
   - Submit deposit request with TXID, email, and user type
   - Wait for admin approval

3. **Stake Tokens**
   - Choose staking pool (30/90/180/360 days)
   - Enter amount to stake
   - Submit request
   - Wait for admin approval
   - Earn daily rewards

4. **Withdraw Tokens**
   - Enter withdrawal amount
   - Provide Polygon wallet address
   - Submit request (3% fee applied)
   - Wait for admin approval

### Admin Flow

1. **Login as Admin**
   - Email: `methruwan@gmail.com`
   - Password: `Methruwan@123200720`

2. **Manage Requests**
   - Review deposit requests (with user type)
   - Approve/reject withdrawals
   - Approve/reject staking requests

3. **Manage Platform**
   - Update OR token price
   - Credit users directly
   - Distribute staking rewards
   - View all user accounts
   - Monitor platform statistics

---

## 🔑 Default Credentials

### Admin Account
- **Email**: methruwan@gmail.com
- **Password**: Methruwan@123200720
- **User ID**: 00001

> ⚠️ **Security Note**: Change admin password after first login in production

---

## 💎 Key Information

### Deposit Address (POL Network)
```
0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC
```

### Token Pricing
- **Starting Price**: $0.50 per OR token
- **Admin Controlled**: Can be updated anytime
- **Real-time Conversion**: All amounts show USD value

### Fees
- **Withdrawal Fee**: 3% of withdrawal amount
- **No deposit fees**
- **No staking fees**

### Staking Pools
| Pool | Duration | Daily Reward |
|------|----------|--------------|
| 30-Day | 30 days | 0.4% |
| 90-Day | 90 days | 0.6% |
| 180-Day | 180 days | 0.8% |
| 360-Day | 360 days | 1.0% |

---

## 🐛 Known Limitations (Figma Make)

When running in Figma Make environment:
- Uses localStorage instead of database
- Data clears when system version changes
- Clipboard API may have restrictions (fallback implemented)
- Not suitable for production use

**Solution**: Deploy to Netlify with MongoDB Atlas for production use.

---

## 🤝 Contributing

This is a proprietary staking platform. For modifications:

1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request with description

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

For deployment assistance or technical support, refer to:
- `DEPLOYMENT.md` - Deployment guide
- Code comments - Inline documentation
- Component files - Implementation details

---

## 🎨 Design Features

- **Dark Theme**: Professional dark mode throughout
- **Gradient Accents**: Purple/blue gradients for visual appeal
- **Responsive Layout**: Works on all device sizes
- **Cloud Background**: Beautiful cloud image on auth pages
- **Toast Notifications**: User-friendly feedback for all actions
- **Progress Bars**: Visual staking progress indicators
- **Card Design**: Modern card-based UI components

---

## 🔄 Version Control

Current system version: `1.0.0`

The platform automatically:
- Initializes admin account on first run
- Handles data migrations
- Maintains data integrity
- Resets on version changes

---

## ✅ Production Checklist

Before going live:

- [ ] Deploy to Netlify
- [ ] Set up MongoDB Atlas
- [ ] Configure environment variables
- [ ] Test all features
- [ ] Verify deposit address
- [ ] Change admin password
- [ ] Enable HTTPS
- [ ] Set up custom domain (optional)
- [ ] Test on mobile devices
- [ ] Monitor initial transactions

---

## 🚨 Important Notes

1. **Security**: Never share admin credentials
2. **Backups**: Enable MongoDB Atlas backups
3. **Monitoring**: Regularly check platform activity
4. **Updates**: Keep dependencies updated
5. **Testing**: Test all features after deployment

---

## 🌟 Future Enhancements

Potential features for future versions:
- Multi-language support
- Email notifications
- 2FA authentication
- Advanced analytics dashboard
- Automated reward distribution
- Referral system
- API integrations
- Mobile app

---

Made with ❤️ for decentralized finance

**Happy Staking! 🚀**
