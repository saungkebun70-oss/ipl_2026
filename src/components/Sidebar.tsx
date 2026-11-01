import React from 'react';
import {
  LayoutDashboard,
  Users,
  Home,
  ShieldAlert,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Building2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Role, Resident } from '../types';

interface SidebarProps {
  activeTab: 'overview' | 'residents' | 'warga-portal' | 'admin';
  setActiveTab: (tab: 'overview' | 'residents' | 'warga-portal' | 'admin') => void;
  currentUser: {
    role: Role;
    name: string;
    title: string;
    blok?: string;
    resident?: Resident;
  };
  totalWarga: number;
  totalUnpaid: number;
  waNotifCount: number;
  onOpenSwitchAccount: () => void;
  onOpenPayModal: () => void;
  onOpenWhatsAppLogs: () => void;
  onOpenAuditLogs: () => void;
  onOpenArchitecture?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  totalWarga,
  totalUnpaid,
  waNotifCount,
  onOpenSwitchAccount,
  onOpenPayModal,
  onOpenWhatsAppLogs,
  onOpenAuditLogs,
  onOpenArchitecture
}) => {
  const isWargaLunas = currentUser.resident?.statusBulanIni === 'Lunas';

  return (
    <aside className="hidden lg:flex flex-col justify-between w-72 bg-white/90 backdrop-blur-md border-r border-slate-200/80 p-5 shrink-0 sticky top-0 h-screen z-20 overflow-y-auto">
      {/* Top Brand & Profile */}
      <div className="space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                Saung Kebun
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                IPL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
              Sistem Keuangan Kas Paguyuban
            </p>
          </div>
        </div>

        {/* Current User Card */}
        <div className="p-3 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Akun Aktif
            </span>
            <button
              onClick={onOpenSwitchAccount}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:underline"
            >
              <span>Ganti Akun</span>
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0 ${
              currentUser.role === 'KETUA'
                ? 'bg-purple-600'
                : currentUser.role === 'BENDAHARA'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}>
              {currentUser.role === 'WARGA' ? (currentUser.blok || 'W') : currentUser.role[0]}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <span className="truncate">{currentUser.title}</span>
                {currentUser.role === 'WARGA' && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                    isWargaLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isWargaLunas ? 'Lunas' : 'Belum Bayar'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Menu Utama
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-slate-500'}`} />
              <span>Kas & Transparansi</span>
            </div>
            {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
          </button>

          <button
            onClick={() => setActiveTab('residents')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'residents'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${activeTab === 'residents' ? 'text-white' : 'text-slate-500'}`} />
              <span>Database Warga</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'residents'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {totalWarga} Unit
            </span>
          </button>

          <button
            onClick={() => setActiveTab('warga-portal')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'warga-portal'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className={`w-4 h-4 ${activeTab === 'warga-portal' ? 'text-white' : 'text-slate-500'}`} />
              <span>Portal Rumah Saya</span>
            </div>
            {currentUser.role === 'WARGA' && !isWargaLunas && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-4 h-4 ${activeTab === 'admin' ? 'text-white' : 'text-slate-500'}`} />
              <span>Panel Pengurus</span>
            </div>
            {totalUnpaid > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'admin'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {totalUnpaid} Tagihan
              </span>
            )}
          </button>
        </div>

        {/* Quick Payment CTA */}
        <div className="pt-2">
          <button
            onClick={onOpenPayModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Iuran IPL Digital</span>
          </button>
        </div>

        {/* Secondary Utilities */}
        <div className="space-y-1 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Transparansi & Notifikasi
          </div>

          <button
            onClick={onOpenWhatsAppLogs}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Notifikasi WhatsApp</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              {waNotifCount}
            </span>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Log Audit Transaksi</span>
            </div>
            <span className="text-[10px] text-slate-400">Keamanan</span>
          </button>

          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 transition-colors font-medium border border-emerald-200/60"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Arsitektur &amp; Webhook</span>
              </div>
              <span className="text-[9px] px-1 py-0.2 bg-emerald-200/80 rounded font-bold">SQL &amp; RLS</span>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Bottom Card */}
      <div className="pt-6 border-t border-slate-200/80">
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 mb-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Cloud Firestore Realtime</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Data 115 unit warga &amp; buku kas tersinkronisasi persisten dan real-time ke database cloud.
          </p>
          <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-700">
            <span>Perumahan Saung Kebun</span>
            <span className="font-mono font-semibold">115 Unit Sync</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
