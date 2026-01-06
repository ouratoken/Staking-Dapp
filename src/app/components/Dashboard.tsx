import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Award, Clock, Calendar, DollarSign, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { getUserData, getTransactions, getTokenPrice } from '../lib/api';
import { formatTokens, formatTokenValue, formatShortDate, calculateDaysRemaining } from '../lib/utils';
import { UserData, Transaction } from '../lib/types';

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrice, setTokenPrice] = useState(0.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, txs, price] = await Promise.all([
        getUserData(userId),
        getTransactions(userId),
        getTokenPrice(),
      ]);
      
      setUserData(data);
      setTransactions(txs.slice(-5).reverse());
      setTokenPrice(price.price);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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

  const activeStakes = userData.stakes.filter(s => s.status === 'active');

  // Calculate progress based on rewards distributed
  const calculateStakeProgress = (stake: any) => {
    const poolDays = parseInt(stake.poolType.split('-')[0]);
    const rewardsDistributed = stake.rewardsDistributed || 0;
    return Math.min(100, (rewardsDistributed / poolDays) * 100);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your staking overview.</p>
      </div>

      {/* Token Price Card */}
      <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Coins className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-300 font-medium">Current OR Token Price</p>
              <h2 className="text-3xl font-bold text-white">${tokenPrice.toFixed(2)}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-300">Updated by Admin</p>
            <p className="text-xs text-slate-400">{formatShortDate(getTokenPrice().updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-300 font-medium">Available</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(userData.balance)}</h3>
          <p className="text-sm text-slate-400">{formatTokenValue(userData.balance, tokenPrice)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-purple-300 font-medium">Locked</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(userData.stakedBalance)}</h3>
          <p className="text-sm text-slate-400">{formatTokenValue(userData.stakedBalance, tokenPrice)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-green-300 font-medium">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(userData.totalRewards)}</h3>
          <p className="text-sm text-slate-400">{formatTokenValue(userData.totalRewards, tokenPrice)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs text-amber-300 font-medium">Latest</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(userData.todaysReward)}</h3>
          <p className="text-sm text-slate-400">{formatTokenValue(userData.todaysReward, tokenPrice)}</p>
        </div>
      </div>

      {/* Active Stakes */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Stakes</h2>
        {activeStakes.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No active stakes yet</p>
            <p className="text-slate-500 text-sm mt-1">Start staking to earn rewards!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeStakes.map((stake) => {
              const daysRemaining = calculateDaysRemaining(stake.endDate);
              const progress = calculateStakeProgress(stake);
              const poolDays = parseInt(stake.poolType.split('-')[0]);
              const rewardsDistributed = stake.rewardsDistributed || 0;
              
              return (
                <div
                  key={stake.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                          {stake.poolType}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {(stake.dailyRewardRate * 100).toFixed(1)}% daily
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{formatTokens(stake.amount)}</h3>
                      <p className="text-sm text-slate-400">{formatTokenValue(stake.amount, tokenPrice)}</p>
                    </div>
                    <div className="text-left md:text-right mt-3 md:mt-0">
                      <p className="text-sm text-slate-400">Accumulated Rewards</p>
                      <p className="text-lg font-bold text-green-400">
                        {formatTokens(stake.accumulatedRewards)}
                      </p>
                      <p className="text-xs text-slate-500">{formatTokenValue(stake.accumulatedRewards, tokenPrice)}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Rewards Distributed: {rewardsDistributed} of {poolDays} days</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Started {formatShortDate(stake.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{daysRemaining} days remaining</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
              >
                <div>
                  <p className="font-medium text-white capitalize">{tx.type.replace('_', ' ')}</p>
                  <p className="text-sm text-slate-400">{formatShortDate(tx.date)}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      tx.type === 'deposit' || tx.type === 'reward' || tx.type === 'admin_credit'
                        ? 'text-green-400'
                        : tx.type === 'withdrawal'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {tx.type === 'deposit' || tx.type === 'reward' || tx.type === 'admin_credit' ? '+' : '-'}
                    {formatTokens(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tx.type === 'deposit' || tx.type === 'reward' || tx.type === 'admin_credit' ? '+' : '-'}
                    {formatTokenValue(tx.amount, tokenPrice)}
                  </p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}