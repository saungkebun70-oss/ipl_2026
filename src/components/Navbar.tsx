import React from 'react';
import { Building2, User, RefreshCw, Bell, ShieldCheck } from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  activeTab: 'overview' | 'residents' | 'warga-portal' | 'admin';
  setActiveTab: (tab: 'overview' | 'residents' | 'warga-portal' | 'admin') => void;
  currentUser: {
    role: Role;
    name: string;
    title: string;
    blok?: string;
  };
  onOpenSwitchAccount: () => void;
  onOpenWhatsAppLogs: () => void;
  onOpenAuditLogs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenSwitchAccount,
  onOpenWhatsAppLogs,
  onOpenAuditLogs
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                IPL Saung Kebun
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                Paguyuban Warga Saung Kebun
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Kas & Transparansi
            </button>

            <button
              onClick={() => setActiveTab('residents')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'residents'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Data Warga (115 Unit)
            </button>

            <button
              onClick={() => setActiveTab('warga-portal')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'warga-portal'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Portal Warga
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Panel Pengurus
            </button>
          </nav>

          {/* Zone 3: Account & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenWhatsAppLogs}
              title="Riwayat Notifikasi WhatsApp"
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenAuditLogs}
              title="Audit Log Transparansi"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSwitchAccount}
              className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all border border-slate-200/60"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                currentUser.role === 'KETUA'
                  ? 'bg-purple-600'
                  : currentUser.role === 'BENDAHARA'
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}>
                {currentUser.role === 'WARGA' ? (currentUser.blok || 'W') : currentUser.role[0]}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {currentUser.title}
                </div>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 hover:rotate-180 transition-transform duration-300 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1 px-2 rounded ${activeTab === 'overview' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'}`}
          >
            Kas & Grafik
          </button>
          <button
            onClick={() => setActiveTab('residents')}
            className={`py-1 px-2 rounded ${activeTab === 'residents' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'}`}
          >
            115 Warga
          </button>
          <button
            onClick={() => setActiveTab('warga-portal')}
            className={`py-1 px-2 rounded ${activeTab === 'warga-portal' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'}`}
          >
            Portal Warga
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-1 px-2 rounded ${activeTab === 'admin' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'}`}
          >
            Pengurus
          </button>
        </div>
      </div>
    </header>
  );
};
