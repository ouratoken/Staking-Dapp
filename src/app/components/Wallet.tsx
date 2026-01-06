import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getUserData as getUserDataAPI,
  getTransactions,
  addDepositRequest as addDepositRequestAPI,
  addWithdrawalRequest as addWithdrawalRequestAPI,
  addStakingRequest as addStakingRequestAPI,
  getDepositRequests,
  getWithdrawalRequests,
  getStakingRequests,
  getTokenPrice as getTokenPriceAPI,
  getAllUsers,
} from '../lib/api';
import {
  formatTokens,
  formatTokenValue,
  formatDate,
  generateId,
  getRandomRewardRate,
  addDays,
  getPoolDuration,
  calculateWithdrawalFee,
  calculateNetWithdrawal,
} from '../lib/utils';
import { UserData, Transaction, Stake } from '../lib/types';

interface WalletProps {
  userId: string;
}

export function Wallet({ userId }: WalletProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'stake'>('overview');
  const [tokenPrice, setTokenPrice] = useState(0.5);
  const [loading, setLoading] = useState(true);

  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxid, setDepositTxid] = useState('');
  const [depositEmail, setDepositEmail] = useState('');
  const [depositUserType, setDepositUserType] = useState<'Introducer' | 'Merchant' | 'Buyer'>('Buyer');

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // Staking form
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakePool, setStakePool] = useState<'30-day' | '90-day' | '180-day' | '360-day'>('30-day');
  const [selectedUnstake, setSelectedUnstake] = useState<Stake | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, txs, price] = await Promise.all([
        getUserDataAPI(userId),
        getTransactions(userId),
        getTokenPriceAPI(),
      ]);
      
      setUserData(data);
      setTransactions(txs.reverse());
      setTokenPrice(price.price);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Get all users to find current user's email
      const allUsers = await getAllUsers();
      const currentUserData = allUsers.find(u => u.userId === userId);
      
      if (!currentUserData) {
        toast.error('User not found');
        return;
      }

      await addDepositRequestAPI({
        id: generateId('deposit'),
        userId,
        userEmail: currentUserData.email,
        amount,
        txid: depositTxid,
        email: depositEmail,
        userType: depositUserType,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      toast.success('Deposit request submitted! Waiting for admin approval.');
      setDepositAmount('');
      setDepositTxid('');
      setDepositEmail('');
      setActiveTab('overview');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit deposit request');
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userData || amount > userData.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const allUsers = await getAllUsers();
      const currentUserData = allUsers.find(u => u.userId === userId);
      
      if (!currentUserData) {
        toast.error('User not found');
        return;
      }

      const fee = calculateWithdrawalFee(amount);
      const netAmount = calculateNetWithdrawal(amount);

      await addWithdrawalRequestAPI({
        id: generateId('withdrawal'),
        userId,
        userEmail: currentUserData.email,
        amount,
        destinationAddress: withdrawAddress,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      toast.success(
        `Withdrawal request submitted! Fee: ${formatTokens(fee)}. You will receive: ${formatTokens(netAmount)}`
      );
      setWithdrawAmount('');
      setWithdrawAddress('');
      setActiveTab('overview');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    }
  };

  const handleStakeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userData || amount > userData.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const allUsers = await getAllUsers();
      const currentUserData = allUsers.find(u => u.userId === userId);
      
      if (!currentUserData) {
        toast.error('User not found');
        return;
      }

      await addStakingRequestAPI({
        id: generateId('stake'),
        userId,
        userEmail: currentUserData.email,
        type: 'stake',
        amount,
        poolType: stakePool,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      toast.success('Staking request submitted! Waiting for admin approval.');
      setStakeAmount('');
      setActiveTab('overview');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit staking request');
    }
  };

  const handleUnstakeRequest = async () => {
    if (!selectedUnstake) return;

    try {
      const allUsers = await getAllUsers();
      const currentUserData = allUsers.find(u => u.userId === userId);
      
      if (!currentUserData) {
        toast.error('User not found');
        return;
      }

      await addStakingRequestAPI({
        id: generateId('unstake'),
        userId,
        userEmail: currentUserData.email,
        type: 'unstake',
        amount: selectedUnstake.amount,
        stakeId: selectedUnstake.id,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      toast.success('Unstaking request submitted! Waiting for admin approval.');
      setSelectedUnstake(null);
      setActiveTab('overview');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit unstaking request');
    }
  };

  // Fallback copy function for restricted environments
  const copyToClipboard = (text: string) => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Deposit address copied to clipboard!');
        })
        .catch(() => {
          // Fallback to older method
          fallbackCopy(text);
        });
    } else {
      // Use fallback method
      fallbackCopy(text);
    }
  };

  // Fallback copy method using textarea
  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success('Deposit address copied to clipboard!');
      } else {
        toast.info('Please copy manually: 0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC');
      }
    } catch (err) {
      toast.info('Please copy manually: 0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC');
    }
  };

  if (loading || !userData) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  const withdrawalFee = withdrawAmount ? calculateWithdrawalFee(parseFloat(withdrawAmount)) : 0;
  const netWithdrawal = withdrawAmount ? calculateNetWithdrawal(parseFloat(withdrawAmount)) : 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-slate-400">Manage your OR tokens and view transaction history</p>
      </div>

      {/* Deposit Address Card */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <WalletIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-blue-300 font-medium">OURA Deposit Address</p>
            <p className="text-xs text-slate-400">POL Network (Polygon)</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Send OR tokens to this address:</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-white font-mono flex-1 break-all">
              0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC
            </code>
            <button
              onClick={() => copyToClipboard('0x223c6722a657EB1e3f096505e35EdC65BDAEb0aC')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-amber-400 mt-3">
            ⚠️ Important: After sending, submit a deposit request below with your transaction ID (TXID)
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-blue-100">Available Balance</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{formatTokens(userData.balance)}</h2>
        <p className="text-blue-100 text-lg mb-6">{formatTokenValue(userData.balance, tokenPrice)}</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-medium transition-all backdrop-blur-sm"
          >
            <Download className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-medium transition-all backdrop-blur-sm"
          >
            <Upload className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('stake')}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Stake Tokens</h3>
          <p className="text-sm text-slate-400">Earn 0.4% - 1% daily rewards</p>
        </button>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingDown className="w-6 h-6 text-purple-400" />
            </div>
            <Minus className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Staked Tokens</h3>
          <p className="text-sm text-white font-medium">{formatTokens(userData.stakedBalance)}</p>
          <p className="text-xs text-slate-400">{formatTokenValue(userData.stakedBalance, tokenPrice)}</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'deposit' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Request Deposit</h2>
          <form onSubmit={handleDepositRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount (OR Tokens)</label>
              <input
                type="number"
                step="0.000001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in OR tokens"
                required
              />
              {depositAmount && (
                <p className="text-sm text-slate-400 mt-2">
                  ≈ {formatTokenValue(parseFloat(depositAmount), tokenPrice)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Transaction ID (TXID)</label>
              <input
                type="text"
                value={depositTxid}
                onChange={(e) => setDepositTxid(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter transaction ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={depositEmail}
                onChange={(e) => setDepositEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">User Type</label>
              <select
                value={depositUserType}
                onChange={(e) => setDepositUserType(e.target.value as 'Introducer' | 'Merchant' | 'Buyer')}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Buyer">Buyer</option>
                <option value="Merchant">Merchant</option>
                <option value="Introducer">Introducer</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Select your role in the platform
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Request Withdrawal</h2>
          
          {/* Withdrawal Fee Notice */}
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Withdrawal Fee: 3%</p>
              <p className="text-xs text-amber-200/70 mt-1">
                A 3% fee will be deducted from your withdrawal amount.
              </p>
            </div>
          </div>

          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount (OR Tokens)</label>
              <input
                type="number"
                step="0.000001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
              <div className="mt-2 space-y-1">
                <p className="text-sm text-slate-400">Available: {formatTokens(userData.balance)}</p>
                {withdrawAmount && (
                  <>
                    <p className="text-sm text-red-400">Fee (3%): {formatTokens(withdrawalFee)}</p>
                    <p className="text-sm text-green-400">You will receive: {formatTokens(netWithdrawal)}</p>
                    <p className="text-xs text-slate-500">≈ {formatTokenValue(netWithdrawal, tokenPrice)}</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Destination Address (OR - Polygon Network Address)
              </label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Polygon wallet address"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Make sure this is a valid Polygon (MATIC) network address
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'stake' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Stake Tokens</h2>
          
          {/* Stake */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Create New Stake</h3>
            <form onSubmit={handleStakeRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pool Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStakePool('30-day')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      stakePool === '30-day'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-white mb-1">30-Day Pool</p>
                    <p className="text-sm text-slate-400">0.4% daily</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStakePool('90-day')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      stakePool === '90-day'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-white mb-1">90-Day Pool</p>
                    <p className="text-sm text-slate-400">0.6% daily</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStakePool('180-day')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      stakePool === '180-day'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-white mb-1">180-Day Pool</p>
                    <p className="text-sm text-slate-400">0.8% daily</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStakePool('360-day')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      stakePool === '360-day'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-white mb-1">360-Day Pool</p>
                    <p className="text-sm text-slate-400">1% daily</p>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (OR Tokens)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount to stake"
                  required
                />
                <p className="text-sm text-slate-400 mt-2">Available: {formatTokens(userData.balance)}</p>
                {stakeAmount && (
                  <p className="text-xs text-slate-500 mt-1">
                    ≈ {formatTokenValue(parseFloat(stakeAmount), tokenPrice)}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Stake Now
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Unstake */}
          {userData.stakes.filter(s => s.status === 'active').length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Or Unstake Existing</h3>
              <div className="space-y-3">
                {userData.stakes.filter(s => s.status === 'active').map((stake) => (
                  <div
                    key={stake.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-white">{formatTokens(stake.amount)}</p>
                      <p className="text-sm text-slate-400">{stake.poolType}</p>
                      <p className="text-xs text-slate-500">Rewards: {formatTokens(stake.accumulatedRewards)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUnstake(stake);
                        handleUnstakeRequest();
                      }}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-all"
                    >
                      Unstake
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      {activeTab === 'overview' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white capitalize">{tx.type.replace('_', ' ')}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-green-500/20 text-green-300'
                            : tx.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{formatDate(tx.date)}</p>
                    {tx.description && (
                      <p className="text-xs text-slate-500 mt-1">{tx.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`font-bold ${
                        tx.type === 'deposit' || tx.type === 'reward' || tx.type === 'admin_credit' || tx.type === 'unstake'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'reward' || tx.type === 'admin_credit' || tx.type === 'unstake' ? '+' : '-'}
                      {formatTokens(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTokenValue(tx.amount, tokenPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}