// API service for communicating with the backend
// Currently using localStorage for Figma Make compatibility
// Can be easily switched to real backend API later

import { User, UserData, Transaction, DepositRequest, WithdrawalRequest, StakingRequest, TokenPrice } from './types';

// ============================================================================
// LOCALSTORAGE SIMULATION (Figma Make Compatible)
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'oura_users',
  TRANSACTIONS: 'oura_transactions',
  DEPOSIT_REQUESTS: 'oura_deposit_requests',
  WITHDRAWAL_REQUESTS: 'oura_withdrawal_requests',
  STAKING_REQUESTS: 'oura_staking_requests',
  TOKEN_PRICE: 'oura_token_price',
  USER_COUNTER: 'oura_user_counter',
  CURRENT_USER: 'oura_current_user',
  AUTH_TOKEN: 'oura_auth_token',
  SYSTEM_VERSION: 'oura_system_version',
};

const CURRENT_SYSTEM_VERSION = '1.1'; // Increment this to force re-initialization

// Helper to get data from localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Helper to save data to localStorage
function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Clear all system data (for debugging/reset)
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All data cleared. Please refresh the page.');
}

// Initialize system data
function initSystemData() {
  // Check if we need to re-initialize due to version change
  const storedVersion = localStorage.getItem(STORAGE_KEYS.SYSTEM_VERSION);
  if (storedVersion !== CURRENT_SYSTEM_VERSION) {
    console.log('System version updated, re-initializing...');
    // Clear old data
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.SYSTEM_VERSION) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(STORAGE_KEYS.SYSTEM_VERSION, CURRENT_SYSTEM_VERSION);
  }

  const users = getFromStorage<Record<string, UserData>>(STORAGE_KEYS.USERS, {});
  
  // Create admin user if not exists
  if (!users['00001']) {
    console.log('Creating admin user...');
    users['00001'] = {
      userId: '00001',
      email: 'methruwan@gmail.com',
      password: 'Methruwan@123200720',
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
    saveToStorage(STORAGE_KEYS.USERS, users);
    console.log('Admin user created successfully');
  }

  // Initialize counter if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USER_COUNTER)) {
    saveToStorage(STORAGE_KEYS.USER_COUNTER, 1);
  }

  // Initialize token price if not exists
  if (!localStorage.getItem(STORAGE_KEYS.TOKEN_PRICE)) {
    saveToStorage(STORAGE_KEYS.TOKEN_PRICE, {
      price: 0.5,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    });
  }

  // Initialize empty arrays if not exist
  if (!localStorage.getItem(STORAGE_KEYS.DEPOSIT_REQUESTS)) {
    saveToStorage(STORAGE_KEYS.DEPOSIT_REQUESTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS)) {
    saveToStorage(STORAGE_KEYS.WITHDRAWAL_REQUESTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAKING_REQUESTS)) {
    saveToStorage(STORAGE_KEYS.STAKING_REQUESTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, {});
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function signUp(email: string, password: string): Promise<{ user: User; session: any }> {
  initSystemData();
  
  const users = getFromStorage<Record<string, UserData>>(STORAGE_KEYS.USERS, {});
  
  // Check if user already exists
  const existingUser = Object.values(users).find(u => u.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Generate new user ID
  const counter = getFromStorage<number>(STORAGE_KEYS.USER_COUNTER, 1);
  const newCounter = counter + 1;
  const userId = String(newCounter).padStart(5, '0');
  
  // Create new user
  const newUser: UserData = {
    userId,
    email,
    password, // In production, this should be hashed!
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

  users[userId] = newUser;
  saveToStorage(STORAGE_KEYS.USERS, users);
  saveToStorage(STORAGE_KEYS.USER_COUNTER, newCounter);

  const user: User = {
    id: userId,
    email,
    role: 'user',
  };

  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  saveToStorage(STORAGE_KEYS.AUTH_TOKEN, 'mock_token_' + userId);

  return {
    user,
    session: { access_token: 'mock_token_' + userId },
  };
}

export async function signIn(email: string, password: string): Promise<{ user: User; session: any }> {
  initSystemData();
  
  const users = getFromStorage<Record<string, UserData>>(STORAGE_KEYS.USERS, {});
  
  console.log('Sign in attempt for:', email);
  console.log('Available users:', Object.keys(users));
  
  const userData = Object.values(users).find(u => u.email === email);
  
  if (!userData) {
    console.error('User not found with email:', email);
    throw new Error('Invalid email or password');
  }

  console.log('User found:', userData.userId);
  console.log('Password match:', userData.password === password);

  if (userData.password !== password) {
    console.error('Password mismatch');
    throw new Error('Invalid email or password');
  }

  const user: User = {
    id: userData.userId,
    email: userData.email,
    role: userData.role,
  };

  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  saveToStorage(STORAGE_KEYS.AUTH_TOKEN, 'mock_token_' + userData.userId);

  console.log('Sign in successful for user:', userData.userId);

  return {
    user,
    session: { access_token: 'mock_token_' + userData.userId },
  };
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function getCurrentUser(): Promise<User | null> {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setAuthToken(token: string | null) {
  if (token) {
    saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// ============================================================================
// USER DATA
// ============================================================================

export async function getUserData(userId: string): Promise<UserData> {
  const users = getFromStorage<Record<string, UserData>>(STORAGE_KEYS.USERS, {});
  const userData = users[userId];
  
  if (!userData) {
    throw new Error('User not found');
  }
  
  return userData;
}

export async function updateUserData(userId: string, userData: UserData): Promise<void> {
  const users = getFromStorage<Record<string, UserData>>(STORAGE_KEYS.USERS, {});
  users[userId] = userData;
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export async function getAllUsers(): Promise<UserData[]> {
  const users = getFromStorage<Record<string, UserData>>(STORAGE_KEYS.USERS, {});
  return Object.values(users);
}

// ============================================================================
// TOKEN PRICE
// ============================================================================

export async function getTokenPrice(): Promise<TokenPrice> {
  return getFromStorage<TokenPrice>(STORAGE_KEYS.TOKEN_PRICE, {
    price: 0.5,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  });
}

export async function updateTokenPrice(price: number, updatedBy: string): Promise<void> {
  const tokenPrice: TokenPrice = {
    price,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  saveToStorage(STORAGE_KEYS.TOKEN_PRICE, tokenPrice);
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const allTransactions = getFromStorage<Record<string, Transaction[]>>(STORAGE_KEYS.TRANSACTIONS, {});
  return allTransactions[userId] || [];
}

export async function addTransaction(userId: string, transaction: Transaction): Promise<void> {
  const allTransactions = getFromStorage<Record<string, Transaction[]>>(STORAGE_KEYS.TRANSACTIONS, {});
  
  if (!allTransactions[userId]) {
    allTransactions[userId] = [];
  }
  
  allTransactions[userId].push(transaction);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, allTransactions);
}

// ============================================================================
// REQUESTS
// ============================================================================

export async function getDepositRequests(): Promise<DepositRequest[]> {
  return getFromStorage<DepositRequest[]>(STORAGE_KEYS.DEPOSIT_REQUESTS, []);
}

export async function addDepositRequest(request: DepositRequest): Promise<void> {
  const requests = await getDepositRequests();
  requests.push(request);
  saveToStorage(STORAGE_KEYS.DEPOSIT_REQUESTS, requests);
}

export async function updateDepositRequests(requests: DepositRequest[]): Promise<void> {
  saveToStorage(STORAGE_KEYS.DEPOSIT_REQUESTS, requests);
}

export async function getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  return getFromStorage<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWAL_REQUESTS, []);
}

export async function addWithdrawalRequest(request: WithdrawalRequest): Promise<void> {
  const requests = await getWithdrawalRequests();
  requests.push(request);
  saveToStorage(STORAGE_KEYS.WITHDRAWAL_REQUESTS, requests);
}

export async function updateWithdrawalRequests(requests: WithdrawalRequest[]): Promise<void> {
  saveToStorage(STORAGE_KEYS.WITHDRAWAL_REQUESTS, requests);
}

export async function getStakingRequests(): Promise<StakingRequest[]> {
  return getFromStorage<StakingRequest[]>(STORAGE_KEYS.STAKING_REQUESTS, []);
}

export async function addStakingRequest(request: StakingRequest): Promise<void> {
  const requests = await getStakingRequests();
  requests.push(request);
  saveToStorage(STORAGE_KEYS.STAKING_REQUESTS, requests);
}

export async function updateStakingRequests(requests: StakingRequest[]): Promise<void> {
  saveToStorage(STORAGE_KEYS.STAKING_REQUESTS, requests);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeSystem(): Promise<void> {
  initSystemData();
}