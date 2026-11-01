import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Home,
  ShieldAlert
} from 'lucide-react';
import { Role } from '../types';

interface BottomNavProps {
  activeTab: 'overview' | 'residents' | 'warga-portal' | 'admin';
  setActiveTab: (tab: 'overview' | 'residents' | 'warga-portal' | 'admin') => void;
  onOpenPayModal: () => void;
  userRole: Role;
  unpaidCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenPayModal,
  userRole,
  unpaidCount
}) => {
  return (
    <nav
      aria-label="Navigasi Bawah Mobile & Tablet"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 select-none"
    >
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-5 items-center h-14">
        {/* Tab 1: Kas & Grafik */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'overview' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Kas
          </span>
        </button>

        {/* Tab 2: Direktori 115 Warga */}
        <button
          onClick={() => setActiveTab('residents')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all ${
            activeTab === 'residents'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {activeTab === 'residents' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Database
          </span>
        </button>

        {/* Tab 3: Center Highlighted Action (Bayar IPL) */}
        <div className="flex items-center justify-center -mt-4">
          <button
            onClick={onOpenPayModal}
            title="Bayar Iuran IPL Digital"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
          >
            <CreditCard className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 4: Portal Warga */}
        <button
          onClick={() => setActiveTab('warga-portal')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all ${
            activeTab === 'warga-portal'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'warga-portal' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Portal
          </span>
        </button>

        {/* Tab 5: Panel Pengurus */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all relative ${
            activeTab === 'admin'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShieldAlert className="w-5 h-5" />
            {unpaidCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
            {activeTab === 'admin' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Pengurus
          </span>
        </button>
      </div>
    </nav>
  );
};
