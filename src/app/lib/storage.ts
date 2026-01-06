// LocalStorage service for data persistence

import { User, UserData, StakingRequest, DepositRequest, WithdrawalRequest, Transaction, TokenPrice } from './types';

const STORAGE_KEYS = {
  USERS: 'staking_users',
  USER_DATA: 'staking_user_data',
  STAKING_REQUESTS: 'staking_requests',
  DEPOSIT_REQUESTS: 'deposit_requests',
  WITHDRAWAL_REQUESTS: 'withdrawal_requests',
  TRANSACTIONS: 'transactions',
  CURRENT_USER: 'current_user_id',
  TOKEN_PRICE: 'token_price',
  USER_COUNTER: 'user_counter',
};

// Simple hash function for password (simulation)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}

// Initialize with default admin user
export function initializeStorage(): void {
  const users = getUsers();
  
  // Initialize token price if not exists
  if (!localStorage.getItem(STORAGE_KEYS.TOKEN_PRICE)) {
    const initialPrice: TokenPrice = {
      price: 0.5,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    };
    localStorage.setItem(STORAGE_KEYS.TOKEN_PRICE, JSON.stringify(initialPrice));
  }
  
  // Initialize user counter
  if (!localStorage.getItem(STORAGE_KEYS.USER_COUNTER)) {
    localStorage.setItem(STORAGE_KEYS.USER_COUNTER, '0');
  }
  
  if (users.length === 0) {
    const adminUser: User = {
      id: '00001',
      email: 'admin@ourastaking.com',
      password: hashPassword('AdminSecurePass123!'),
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    
    const adminData: UserData = {
      userId: '00001',
      balance: 1000000,
      stakedBalance: 0,
      totalRewards: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      stakes: [],
      todaysReward: 0,
      lastRewardUpdate: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify([adminData]));
    localStorage.setItem(STORAGE_KEYS.STAKING_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.USER_COUNTER, '1');
  }
}

// Users
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

// User Data
export function getAllUserData(): UserData[] {
  const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : [];
}

export function saveAllUserData(userData: UserData[]): void {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
}

export function getUserData(userId: string): UserData | undefined {
  return getAllUserData().find(ud => ud.userId === userId);
}

export function saveUserData(userData: UserData): void {
  const allData = getAllUserData();
  const index = allData.findIndex(ud => ud.userId === userData.userId);
  if (index >= 0) {
    allData[index] = userData;
  } else {
    allData.push(userData);
  }
  saveAllUserData(allData);
}

// Staking Requests
export function getStakingRequests(): StakingRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.STAKING_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function saveStakingRequests(requests: StakingRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.STAKING_REQUESTS, JSON.stringify(requests));
}

export function addStakingRequest(request: StakingRequest): void {
  const requests = getStakingRequests();
  requests.push(request);
  saveStakingRequests(requests);
}

// Deposit Requests
export function getDepositRequests(): DepositRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEPOSIT_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function saveDepositRequests(requests: DepositRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.DEPOSIT_REQUESTS, JSON.stringify(requests));
}

export function addDepositRequest(request: DepositRequest): void {
  const requests = getDepositRequests();
  requests.push(request);
  saveDepositRequests(requests);
}

// Withdrawal Requests
export function getWithdrawalRequests(): WithdrawalRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function saveWithdrawalRequests(requests: WithdrawalRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS, JSON.stringify(requests));
}

export function addWithdrawalRequest(request: WithdrawalRequest): void {
  const requests = getWithdrawalRequests();
  requests.push(request);
  saveWithdrawalRequests(requests);
}

// Transactions
export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
}

export function getUserTransactions(userId: string): Transaction[] {
  return getTransactions().filter(t => t.userId === userId);
}

// Current User Session
export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): User | null {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return getUserById(userId) || null;
}

// Token Price Management
export function getTokenPrice(): TokenPrice {
  const data = localStorage.getItem(STORAGE_KEYS.TOKEN_PRICE);
  return data ? JSON.parse(data) : { price: 0.5, updatedAt: new Date().toISOString(), updatedBy: 'system' };
}

export function setTokenPrice(price: number, updatedBy: string): void {
  const tokenPrice: TokenPrice = {
    price,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  localStorage.setItem(STORAGE_KEYS.TOKEN_PRICE, JSON.stringify(tokenPrice));
}

// User Counter Management
export function getUserCounter(): number {
  const counter = localStorage.getItem(STORAGE_KEYS.USER_COUNTER);
  return counter ? parseInt(counter, 10) : 0;
}

export function incrementUserCounter(): number {
  const current = getUserCounter();
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.USER_COUNTER, next.toString());
  return next;
}