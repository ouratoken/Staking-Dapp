// Core types for the staking platform

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  role: "user" | "admin";
  createdAt: string;
}

export interface Stake {
  id: string;
  poolType: "30-day" | "90-day" | "180-day" | "360-day";
  amount: number;
  startDate: string;
  endDate: string;
  dailyRewardRate: number;
  accumulatedRewards: number;
  status: "active" | "completed";
  rewardsDistributed: number; // Track how many times rewards have been distributed
}

export interface UserData {
  userId: string;
  email: string;
  password?: string; // Optional for security reasons
  role: "user" | "admin";
  balance: number; // in OR tokens
  stakedBalance: number; // in OR tokens
  totalRewards: number; // in OR tokens
  totalDeposited: number; // in OR tokens
  totalWithdrawn: number; // in OR tokens
  stakes: Stake[];
  todaysReward: number; // in OR tokens
  lastRewardUpdate: string;
  createdAt: string;
}

export interface StakingRequest {
  id: string;
  userId: string;
  userEmail: string;
  type: "stake" | "unstake";
  amount: number;
  poolType?: "30-day" | "90-day" | "180-day" | "360-day";
  stakeId?: string; // for unstake requests
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  processedAt?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  txid: string;
  email: string; // user's email for verification
  userType: 'Introducer' | 'Merchant' | 'Buyer'; // User type selection
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  processedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  destinationAddress: string;
  status: "pending" | "approved" | "rejected" | "processing";
  timestamp: string;
  processedAt?: string;
  processedDate?: string; // 24h processing time
}

export interface Transaction {
  id: string;
  userId: string;
  type:
    | "deposit"
    | "withdrawal"
    | "stake"
    | "unstake"
    | "reward"
    | "admin_credit";
  amount: number;
  status: "pending" | "completed" | "rejected";
  date: string;
  description: string;
}

export interface SystemStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalStaked: number;
  totalRewardsDistributed: number;
  activeStakes: number;
  currentTokenPrice: number; // Current OR token price in USD
}

export interface TokenPrice {
  price: number; // Price in USD
  updatedAt: string;
  updatedBy: string; // Admin who updated it
}