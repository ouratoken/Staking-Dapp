import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Check,
  X,
  Plus,
  Search,
  Coins,
  Edit2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllUsers,
  getUserData,
  updateUserData,
  getDepositRequests,
  updateDepositRequests,
  getWithdrawalRequests,
  updateWithdrawalRequests,
  getStakingRequests,
  updateStakingRequests,
  addTransaction,
  getTokenPrice as getTokenPriceAPI,
  updateTokenPrice,
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
import { UserData, DepositRequest, WithdrawalRequest, StakingRequest, SystemStats, Stake } from '../lib/types';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'requests'>('overview');
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalStaked: 0,
    totalRewardsDistributed: 0,
    activeStakes: 0,
    currentTokenPrice: 0.5,
  });

  const [allUserData, setAllUserData] = useState<UserData[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [stakingRequests, setStakingRequests] = useState<StakingRequest[]>([]);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [tokenPrice, setTokenPriceState] = useState(0.5);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newTokenPrice, setNewTokenPrice] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, deposits, withdrawals, staking, price] = await Promise.all([
        getAllUsers(),
        getDepositRequests(),
        getWithdrawalRequests(),
        getStakingRequests(),
        getTokenPriceAPI(),
      ]);
      
      const users = userData.filter(u => u.role !== 'admin');
      
      setAllUserData(userData);
      setDepositRequests(deposits);
      setWithdrawalRequests(withdrawals);
      setStakingRequests(staking);
      setTokenPriceState(price.price);

      // Calculate stats
      const totalDeposits = userData.reduce((sum, u) => sum + (u.totalDeposited || 0), 0);
      const totalWithdrawals = userData.reduce((sum, u) => sum + (u.totalWithdrawn || 0), 0);
      const totalStaked = userData.reduce((sum, u) => sum + (u.stakedBalance || 0), 0);
      const totalRewards = userData.reduce((sum, u) => sum + (u.totalRewards || 0), 0);
      const activeStakes = userData.reduce((sum, u) => sum + u.stakes.filter(s => s.status === 'active').length, 0);

      setStats({
        totalUsers: users.length,
        totalDeposits,
        totalWithdrawals,
        totalStaked,
        totalRewardsDistributed: totalRewards,
        activeStakes,
        currentTokenPrice: price.price,
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTokenPrice = async () => {
    const price = parseFloat(newTokenPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await updateTokenPrice(price, '00001'); // Admin ID
      setTokenPriceState(price);
      setIsEditingPrice(false);
      setNewTokenPrice('');
      toast.success(`Token price updated to $${price.toFixed(2)}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update token price');
    }
  };

  const handleApproveDeposit = async (request: DepositRequest) => {
    try {
      const userData = await getUserData(request.userId);
      if (!userData) return;

      userData.balance += request.amount;
      userData.totalDeposited += request.amount;
      await updateUserData(request.userId, userData);

      const requests = await getDepositRequests();
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index].status = 'approved';
        requests[index].processedAt = new Date().toISOString();
        await updateDepositRequests(requests);
      }

      await addTransaction(request.userId, {
        id: generateId('tx'),
        userId: request.userId,
        type: 'deposit',
        amount: request.amount,
        status: 'completed',
        date: new Date().toISOString(),
        description: `Deposit approved - TXID: ${request.txid}`,
      });

      toast.success(`Deposit of ${formatTokens(request.amount)} approved`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (request: DepositRequest) => {
    try {
      const requests = await getDepositRequests();
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index].status = 'rejected';
        requests[index].processedAt = new Date().toISOString();
        await updateDepositRequests(requests);
      }

      toast.success('Deposit request rejected');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject deposit');
    }
  };

  const handleApproveWithdrawal = async (request: WithdrawalRequest) => {
    try {
      const userData = await getUserData(request.userId);
      if (!userData) return;

      if (userData.balance < request.amount) {
        toast.error('User has insufficient balance');
        return;
      }

      const fee = calculateWithdrawalFee(request.amount);
      const netAmount = calculateNetWithdrawal(request.amount);

      userData.balance -= request.amount;
      userData.totalWithdrawn += netAmount;
      await updateUserData(request.userId, userData);

      const requests = await getWithdrawalRequests();
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index].status = 'approved';
        requests[index].processedAt = new Date().toISOString();
        requests[index].processedDate = addDays(new Date(), 1).toISOString();
        await updateWithdrawalRequests(requests);
      }

      await addTransaction(request.userId, {
        id: generateId('tx'),
        userId: request.userId,
        type: 'withdrawal',
        amount: request.amount,
        status: 'completed',
        date: new Date().toISOString(),
        description: `Withdrawal approved - Fee: ${formatTokens(fee)} - Net: ${formatTokens(netAmount)} - To ${request.destinationAddress}`,
      });

      toast.success(`Withdrawal approved. User receives ${formatTokens(netAmount)} (3% fee deducted).`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (request: WithdrawalRequest) => {
    try {
      const requests = await getWithdrawalRequests();
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index].status = 'rejected';
        requests[index].processedAt = new Date().toISOString();
        await updateWithdrawalRequests(requests);
      }

      toast.success('Withdrawal request rejected');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject withdrawal');
    }
  };

  const handleApproveStaking = async (request: StakingRequest) => {
    try {
      const userData = await getUserData(request.userId);
      if (!userData) return;

      if (request.type === 'stake') {
        if (userData.balance < request.amount) {
          toast.error('User has insufficient balance');
          return;
        }

        const poolDays = getPoolDuration(request.poolType!);
        const startDate = new Date();
        const endDate = addDays(startDate, poolDays);

        const newStake: Stake = {
          id: generateId('stake'),
          poolType: request.poolType!,
          amount: request.amount,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dailyRewardRate: getRandomRewardRate(request.poolType!),
          accumulatedRewards: 0,
          status: 'active',
          rewardsDistributed: 0, // Track number of reward distributions
        };

        userData.balance -= request.amount;
        userData.stakedBalance += request.amount;
        userData.stakes.push(newStake);
        await updateUserData(request.userId, userData);

        await addTransaction(request.userId, {
          id: generateId('tx'),
          userId: request.userId,
          type: 'stake',
          amount: request.amount,
          status: 'completed',
          date: new Date().toISOString(),
          description: `Staked in ${request.poolType} pool`,
        });

        toast.success(`Staking of ${formatTokens(request.amount)} approved`);
      } else if (request.type === 'unstake') {
        const stakeIndex = userData.stakes.findIndex(s => s.id === request.stakeId);
        if (stakeIndex >= 0) {
          const stake = userData.stakes[stakeIndex];
          
          userData.balance += stake.amount + stake.accumulatedRewards;
          userData.stakedBalance -= stake.amount;
          userData.totalRewards += stake.accumulatedRewards;
          userData.stakes[stakeIndex].status = 'completed';
          await updateUserData(request.userId, userData);

          await addTransaction(request.userId, {
            id: generateId('tx'),
            userId: request.userId,
            type: 'unstake',
            amount: stake.amount,
            status: 'completed',
            date: new Date().toISOString(),
            description: `Unstaked from ${stake.poolType} pool`,
          });

          if (stake.accumulatedRewards > 0) {
            await addTransaction(request.userId, {
              id: generateId('tx'),
              userId: request.userId,
              type: 'reward',
              amount: stake.accumulatedRewards,
              status: 'completed',
              date: new Date().toISOString(),
              description: `Rewards from ${stake.poolType} stake`,
            });
          }

          toast.success(`Unstaking approved. ${formatTokens(stake.amount + stake.accumulatedRewards)} returned.`);
        }
      }

      const requests = await getStakingRequests();
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index].status = 'approved';
        requests[index].processedAt = new Date().toISOString();
        await updateStakingRequests(requests);
      }

      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve staking');
    }
  };

  const handleRejectStaking = async (request: StakingRequest) => {
    try {
      const requests = await getStakingRequests();
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index].status = 'rejected';
        requests[index].processedAt = new Date().toISOString();
        await updateStakingRequests(requests);
      }

      toast.success('Staking request rejected');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject staking');
    }
  };

  const handleCreditUser = async () => {
    if (!selectedUser) return;

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const userData = await getUserData(selectedUser.userId);
    if (!userData) return;

    userData.balance += amount;
    await updateUserData(selectedUser.userId, userData);

    await addTransaction(selectedUser.userId, {
      id: generateId('tx'),
      userId: selectedUser.userId,
      type: 'admin_credit',
      amount: amount,
      status: 'completed',
      date: new Date().toISOString(),
      description: 'Admin manual credit',
    });

    toast.success(`${formatTokens(amount)} credited to user`);
    setCreditAmount('');
    setSelectedUser(null);
    loadData();
  };

  // Credit rewards to ALL active stakes for a user
  const handleCreditRewards = async (userId: string) => {
    const userData = await getUserData(userId);
    if (!userData) return;

    let totalReward = 0;
    let stakesUpdated = 0;

    // Calculate and add rewards for ALL active stakes
    userData.stakes.forEach(stake => {
      if (stake.status === 'active') {
        const dailyReward = stake.amount * stake.dailyRewardRate;
        stake.accumulatedRewards += dailyReward;
        stake.rewardsDistributed = (stake.rewardsDistributed || 0) + 1;
        totalReward += dailyReward;
        stakesUpdated++;
      }
    });

    if (totalReward > 0) {
      userData.todaysReward = totalReward;
      userData.lastRewardUpdate = new Date().toISOString();
      await updateUserData(userId, userData);

      toast.success(`${formatTokens(totalReward)} rewards distributed to ${stakesUpdated} active stake(s)`);
      loadData();
    } else {
      toast.info('No active stakes to credit rewards');
    }
  };

  const pendingDeposits = depositRequests.filter(r => r.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending');
  const pendingStakingRequests = stakingRequests.filter(r => r.status === 'pending');

  const filteredUsers = allUserData.filter(ud => {
    if (ud.role === 'admin') return false;
    if (!searchTerm) return true;
    return ud.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
           ud.userId.includes(searchTerm);
  });

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-slate-400">Manage users, requests, and system operations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all relative ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Requests
          {(pendingDeposits.length + pendingWithdrawals.length + pendingStakingRequests.length) > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingDeposits.length + pendingWithdrawals.length + pendingStakingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Token Price Management */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-300 font-medium">OR Token Price (USD)</p>
                  <h2 className="text-3xl font-bold text-white">${tokenPrice.toFixed(2)}</h2>
                </div>
              </div>
              {!isEditingPrice ? (
                <button
                  onClick={() => {
                    setIsEditingPrice(true);
                    setNewTokenPrice(tokenPrice.toString());
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Update Price
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={newTokenPrice}
                    onChange={(e) => setNewTokenPrice(e.target.value)}
                    className="w-32 bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-white"
                    placeholder="Price"
                  />
                  <button
                    onClick={handleUpdateTokenPrice}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPrice(false);
                      setNewTokenPrice('');
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-amber-200/70">
              This price is used to calculate USD values across the platform. Updated daily.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</h3>
              <p className="text-sm text-slate-400">Total Users</p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(stats.totalDeposits)}</h3>
              <p className="text-sm text-slate-400">Total Deposits</p>
              <p className="text-xs text-slate-500">{formatTokenValue(stats.totalDeposits, tokenPrice)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(stats.totalStaked)}</h3>
              <p className="text-sm text-slate-400">Total Staked</p>
              <p className="text-xs text-slate-500">{formatTokenValue(stats.totalStaked, tokenPrice)}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(stats.totalWithdrawals)}</h3>
              <p className="text-sm text-slate-400">Total Withdrawals</p>
              <p className="text-xs text-slate-500">{formatTokenValue(stats.totalWithdrawals, tokenPrice)}</p>
            </div>

            <div className="bg-gradient-to-br from-rose-600/20 to-rose-800/20 border border-rose-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-rose-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-rose-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.activeStakes}</h3>
              <p className="text-sm text-slate-400">Active Stakes</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{formatTokens(stats.totalRewardsDistributed)}</h3>
              <p className="text-sm text-slate-400">Rewards Distributed</p>
              <p className="text-xs text-slate-500">{formatTokenValue(stats.totalRewardsDistributed, tokenPrice)}</p>
            </div>
          </div>

          {/* Pending Requests Summary */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Pending Requests Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Deposit Requests</p>
                <p className="text-2xl font-bold text-white">{pendingDeposits.length}</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Withdrawal Requests</p>
                <p className="text-2xl font-bold text-white">{pendingWithdrawals.length}</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Staking Requests</p>
                <p className="text-2xl font-bold text-white">{pendingStakingRequests.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search users by email or ID..."
              />
            </div>
          </div>

          {/* Users List */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">User ID</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Email</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Balance</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Staked</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Rewards</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((ud) => {
                    return (
                      <tr key={ud.userId} className="border-b border-slate-700 hover:bg-slate-900/30">
                        <td className="p-4">
                          <p className="text-blue-400 font-mono">{ud.userId}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">{ud.email}</p>
                        </td>
                        <td className="text-right p-4">
                          <p className="text-white font-medium">{formatTokens(ud.balance)}</p>
                          <p className="text-xs text-slate-500">{formatTokenValue(ud.balance, tokenPrice)}</p>
                        </td>
                        <td className="text-right p-4">
                          <p className="text-white font-medium">{formatTokens(ud.stakedBalance)}</p>
                          <p className="text-xs text-slate-500">{formatTokenValue(ud.stakedBalance, tokenPrice)}</p>
                        </td>
                        <td className="text-right p-4">
                          <p className="text-green-400 font-medium">{formatTokens(ud.totalRewards)}</p>
                          <p className="text-xs text-slate-500">{formatTokenValue(ud.totalRewards, tokenPrice)}</p>
                        </td>
                        <td className="text-right p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedUser(ud)}
                              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all"
                            >
                              Credit
                            </button>
                            <button
                              onClick={() => handleCreditRewards(ud.userId)}
                              className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-all"
                              title="Distribute rewards to ALL active stakes"
                            >
                              Rewards
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit User Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Credit User Balance</h3>
                <p className="text-slate-400 mb-4">
                  User: {selectedUser.email}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount (OR Tokens)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount to credit"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreditUser}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all"
                  >
                    Credit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setCreditAmount('');
                    }}
                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Deposit Requests */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Deposit Requests
              {pendingDeposits.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                  {pendingDeposits.length} pending
                </span>
              )}
            </h2>
            {pendingDeposits.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No pending deposit requests</p>
            ) : (
              <div className="space-y-3">
                {pendingDeposits.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">
                          {req.userEmail} - {formatTokens(req.amount)}
                        </p>
                        <p className="text-sm text-slate-400">TXID: {req.txid}</p>
                        <p className="text-sm text-slate-400">Email: {req.email}</p>
                        <p className="text-sm text-blue-400">User Type: {req.userType}</p>
                        <p className="text-xs text-slate-500">{formatDate(req.timestamp)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveDeposit(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-all"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-all"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal Requests */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Withdrawal Requests
              {pendingWithdrawals.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                  {pendingWithdrawals.length} pending
                </span>
              )}
            </h2>
            {pendingWithdrawals.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No pending withdrawal requests</p>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map((req) => {
                  const fee = calculateWithdrawalFee(req.amount);
                  const netAmount = calculateNetWithdrawal(req.amount);
                  
                  return (
                    <div key={req.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">
                            {req.userEmail} - {formatTokens(req.amount)}
                          </p>
                          <p className="text-sm text-red-400">Fee (3%): {formatTokens(fee)}</p>
                          <p className="text-sm text-green-400">Net Amount: {formatTokens(netAmount)}</p>
                          <p className="text-sm text-slate-400">To: {req.destinationAddress}</p>
                          <p className="text-xs text-slate-500">{formatDate(req.timestamp)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveWithdrawal(req)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-all"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(req)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-all"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Staking Requests */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Staking Requests
              {pendingStakingRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                  {pendingStakingRequests.length} pending
                </span>
              )}
            </h2>
            {pendingStakingRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No pending staking requests</p>
            ) : (
              <div className="space-y-3">
                {pendingStakingRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">
                          {req.userEmail} - {req.type === 'stake' ? 'Stake' : 'Unstake'} {formatTokens(req.amount)}
                        </p>
                        {req.poolType && (
                          <p className="text-sm text-slate-400">Pool: {req.poolType}</p>
                        )}
                        <p className="text-xs text-slate-500">{formatDate(req.timestamp)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveStaking(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-all"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectStaking(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-all"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}