import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Calendar, Shield, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getUserById, getUsers, saveUsers, hashPassword } from '../lib/storage';
import { validatePassword, formatDate } from '../lib/utils';
import { User } from '../lib/types';

interface ProfileProps {
  userId: string;
}

export function Profile({ userId }: ProfileProps) {
  const [user, setUser] = useState<User | null>(getUserById(userId));
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return <div className="p-8 text-white">User not found</div>;
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify current password
    if (hashPassword(currentPassword) !== user.password) {
      toast.error('Current password is incorrect');
      return;
    }

    // Validate new password
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      toast.error(passwordCheck.message || 'Password does not meet requirements');
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Update password
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      users[userIndex].password = hashPassword(newPassword);
      saveUsers(users);
      setUser(users[userIndex]);
      
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-slate-400">Manage your account settings</p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.email.split('@')[0]}</h2>
            <p className="text-slate-400">
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Email Address</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Account Role</p>
              <p className="text-white font-medium capitalize">{user.role}</p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Member Since</p>
              <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Password & Security</h2>
            <p className="text-sm text-slate-400">Update your password to keep your account secure</p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
              >
                <Check className="w-4 h-4" />
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-300 mb-3">Security Tips</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Use a strong, unique password that you don't use on other sites</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Never share your password with anyone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Change your password regularly to maintain account security</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Contact support if you notice any suspicious activity</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
