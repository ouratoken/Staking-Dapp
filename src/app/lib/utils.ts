// Utility functions

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate sequential user ID (00001, 00002, etc.)
export function generateUserId(currentCount: number): string {
  const nextId = currentCount + 1;
  return String(nextId).padStart(5, '0');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format OR tokens
export function formatTokens(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount) + ' OR';
}

// Calculate USD value of tokens
export function formatTokenValue(tokens: number, pricePerToken: number): string {
  const value = tokens * pricePerToken;
  return formatCurrency(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function calculateDaysRemaining(endDate: string): number {
  if (!endDate) return 0;
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return 0;
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calculateProgress(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  const now = new Date().getTime();
  
  if (now >= end) return 100;
  if (now <= start) return 0;
  
  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export function getRandomRewardRate(poolType: '30-day' | '90-day' | '180-day' | '360-day'): number {
  switch (poolType) {
    case '30-day':
      return 0.004; // 0.4%
    case '90-day':
      return 0.006; // 0.6%
    case '180-day':
      return 0.008; // 0.8%
    case '360-day':
      return 0.01; // 1%
    default:
      return 0.004;
  }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Calculate pool duration in days
export function getPoolDuration(poolType: '30-day' | '90-day' | '180-day' | '360-day'): number {
  switch (poolType) {
    case '30-day':
      return 30;
    case '90-day':
      return 90;
    case '180-day':
      return 180;
    case '360-day':
      return 360;
    default:
      return 30;
  }
}

// Calculate withdrawal fee (3%)
export function calculateWithdrawalFee(amount: number): number {
  return amount * 0.03;
}

export function calculateNetWithdrawal(amount: number): number {
  return amount - calculateWithdrawalFee(amount);
}