import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import {
  LayoutDashboard,
  Wallet,
  User,
  MessageCircle,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Wallet as WalletPage } from './components/Wallet';
import { Profile } from './components/Profile';
import { Contact } from './components/Contact';
import { AdminPanel } from './components/AdminPanel';
import { getCurrentUser, clearCurrentUser } from './lib/storage';
import { User as UserType } from './lib/types';
import { toast } from 'sonner';

type Page = 'dashboard' | 'wallet' | 'profile' | 'contact' | 'admin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setCurrentPage('dashboard');
    toast.success('Logged out successfully');
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  const navItems = isAdmin
    ? [
        { id: 'admin' as Page, label: 'Admin Panel', icon: Shield },
        { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile' as Page, label: 'Profile', icon: User },
        { id: 'contact' as Page, label: 'Contact', icon: MessageCircle },
      ]
    : [
        { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'wallet' as Page, label: 'Wallet', icon: Wallet },
        { id: 'profile' as Page, label: 'Profile', icon: User },
        { id: 'contact' as Page, label: 'Contact', icon: MessageCircle },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-800">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Oura Staking</h1>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Admin' : 'OR Tokens'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Oura Staking</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 rounded-xl font-medium mt-4"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 pt-20 lg:pt-0">
        {currentPage === 'dashboard' && <Dashboard userId={currentUser.id} />}
        {currentPage === 'wallet' && <WalletPage userId={currentUser.id} />}
        {currentPage === 'profile' && <Profile userId={currentUser.id} />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'admin' && isAdmin && <AdminPanel />}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}