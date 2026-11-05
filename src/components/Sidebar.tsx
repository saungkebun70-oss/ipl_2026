import React from 'react';
import {
  LayoutDashboard,
  Users,
  Home,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Building2,
  ChevronRight,
  Wallet,
  Receipt,
  Crown,
  FileSpreadsheet,
  Sparkles,
  ArrowRightLeft,
  Shield,
  Car,
  AlertTriangle,
  Phone,
  Share2,
  KeyRound,
  LogOut,
  Globe
} from 'lucide-react';
import { Role, Resident, AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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
  onOpenVercelDeploy?: () => void;
  onOpenShareApp?: () => void;
  onOpenAccountManager?: () => void;
  onLogout?: () => void;
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
  onOpenArchitecture,
  onOpenVercelDeploy,
  onOpenShareApp,
  onOpenAccountManager,
  onLogout
}) => {
  const isWargaLunas = currentUser.resident?.statusBulanIni === 'Lunas';

  return (
    <aside className="hidden lg:flex flex-col justify-between w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/80 p-5 shrink-0 sticky top-0 h-screen z-20 overflow-y-auto">
      {/* Top Brand & Profile */}
      <div className="space-y-5">
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
              {currentUser.role === 'WARGA' ? 'Portal Warga' : currentUser.role === 'BENDAHARA' ? 'Portal Bendahara' : currentUser.role === 'KEAMANAN' ? 'Portal Keamanan' : 'Portal Ketua'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSwitchAccount}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:underline cursor-pointer"
                title="Ganti Akun"
              >
                <span>Ganti</span>
                <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
                  title="Keluar dari akun saat ini"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0 ${
              currentUser.role === 'KETUA'
                ? 'bg-purple-600'
                : currentUser.role === 'BENDAHARA'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}>
              {currentUser.role === 'WARGA' ? (currentUser.blok || 'W') : currentUser.role === 'BENDAHARA' ? 'BD' : 'KT'}
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

        {/* 1. ROLE SPECIFIC NAVIGATION: WARGA */}
        {currentUser.role === 'WARGA' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
              <span>Navigasi Warga</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded">Portal Warga</span>
            </div>

            <button
              onClick={() => setActiveTab('warga-portal')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'warga-portal'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className={`w-4 h-4 ${activeTab === 'warga-portal' ? 'text-white' : 'text-slate-500'}`} />
                <span>Portal Rumah Saya</span>
              </div>
              {!isWargaLunas && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-slate-500'}`} />
                <span>Kas Warga & Transparansi</span>
              </div>
              {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            <button
              onClick={() => setActiveTab('residents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'residents'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-4 h-4 ${activeTab === 'residents' ? 'text-white' : 'text-slate-500'}`} />
                <span>Direktori 141 Kavling</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'residents'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {totalWarga} Unit
              </span>
            </button>

            {/* Quick Payment CTA for Warga */}
            <div className="pt-2">
              <button
                onClick={onOpenPayModal}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Bayar Iuran IPL Digital</span>
              </button>
            </div>

            {/* Switch to Pengurus Access */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={onOpenSwitchAccount}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Akses Pengurus Paguyuban</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Pilih Akun</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. ROLE SPECIFIC NAVIGATION: BENDAHARA */}
        {currentUser.role === 'BENDAHARA' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-3 mb-2 flex items-center justify-between">
              <span>Portal Bendahara Kas</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 font-bold rounded">Keuangan</span>
            </div>

            <button
              onClick={() => setActiveTab('bendahara')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bendahara'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className={`w-4 h-4 ${activeTab === 'bendahara' ? 'text-white' : 'text-blue-600'}`} />
                <span className="truncate">Kasir &amp; Verifikasi Setoran</span>
              </div>
              {totalUnpaid > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'bendahara'
                    ? 'bg-blue-800 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {totalUnpaid} Tagihan
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('residents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'residents'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'residents' ? 'text-white' : 'text-blue-600'}`} />
                <span>Matriks Iuran 141 Kavling</span>
              </div>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                activeTab === 'residents' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                Feb-Sept
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-blue-600'}`} />
                <span>Buku Kas &amp; Pengeluaran</span>
              </div>
              {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Quick Action Tools for Bendahara */}
            <div className="pt-2 space-y-1">
              <button
                onClick={onOpenWhatsAppLogs}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Broadcast Tagihan WA</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  {waNotifCount}
                </span>
              </button>

              <button
                onClick={onOpenAuditLogs}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Audit Trail Transaksi</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 3. ROLE SPECIFIC NAVIGATION: KETUA */}
        {currentUser.role === 'KETUA' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 px-3 mb-2 flex items-center justify-between">
              <span>Portal Ketua Paguyuban</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 font-bold rounded">Supervisi</span>
            </div>

            <button
              onClick={() => setActiveTab('ketua')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ketua'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Crown className={`w-4 h-4 ${activeTab === 'ketua' ? 'text-white' : 'text-purple-600'}`} />
                <span className="truncate">Supervisi &amp; Maklumat</span>
              </div>
              {activeTab === 'ketua' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-purple-600'}`} />
                <span>Laporan Transparansi Kas</span>
              </div>
              {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            <button
              onClick={() => setActiveTab('residents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'residents'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 ${activeTab === 'residents' ? 'text-white' : 'text-purple-600'}`} />
                <span>Sensus 141 Kavling Warga</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'residents'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {totalWarga} Unit
              </span>
            </button>

            {/* Ketua Tools */}
            <div className="pt-2 space-y-1">
              <button
                onClick={onOpenAuditLogs}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition-colors font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Inspeksi Audit Trail</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">Integritas</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. ROLE SPECIFIC NAVIGATION: KEAMANAN (SATPAM & POS JAGA) */}
        {currentUser.role === 'KEAMANAN' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-3 mb-2 flex items-center justify-between">
              <span>Portal Keamanan &amp; Pos Jaga</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">24 Jam</span>
            </div>

            <button
              onClick={() => setActiveTab('keamanan')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'keamanan'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-4 h-4 ${activeTab === 'keamanan' ? 'text-white' : 'text-amber-600'}`} />
                <span className="truncate">Pos Jaga &amp; Buku Tamu</span>
              </div>
              {activeTab === 'keamanan' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            <button
              onClick={() => setActiveTab('residents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'residents'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Phone className={`w-4 h-4 ${activeTab === 'residents' ? 'text-white' : 'text-amber-600'}`} />
                <span>Interkom Kontak 141 Kavling</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'residents' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {totalWarga} Unit
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-amber-600'}`} />
                <span>Laporan Kas Paguyuban</span>
              </div>
              {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Quick Emergency Button for Guard */}
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('keamanan')}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span>🚨 Panic Button (Darurat)</span>
              </button>
            </div>
          </div>
        )}

        {/* Secondary Utilities & Vercel */}
        <div className="space-y-1 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
            <span>Publikasi &amp; Akses Warga</span>
          </div>

          {onOpenShareApp && (
            <button
              onClick={onOpenShareApp}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-teal-900 bg-teal-50 hover:bg-teal-100/80 transition-colors font-bold border border-teal-200/80 cursor-pointer mb-1 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-teal-700" />
                <span>Bagikan Tautan Warga</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-teal-600 text-white rounded-full font-bold">24/7 Live</span>
            </button>
          )}

          {onOpenAccountManager && (currentUser.role === 'BENDAHARA' || currentUser.role === 'KETUA') && (
            <button
              onClick={onOpenAccountManager}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-blue-900 bg-blue-50 hover:bg-blue-100/80 transition-colors font-bold border border-blue-200/80 cursor-pointer mb-1 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-blue-700" />
                <span>Kelola 141 Akun Warga</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-bold">Admin</span>
            </button>
          )}

          {onOpenVercelDeploy && (
            <button
              onClick={onOpenVercelDeploy}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors font-semibold shadow-xs cursor-pointer mb-1"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 76 65" fill="none">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span>Deploy Vercel Otomatis</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-400 text-slate-950 rounded-full font-bold">Auto</span>
            </button>
          )}

          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 transition-colors font-medium border border-emerald-200/60 cursor-pointer"
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
            Data {totalWarga} unit warga &amp; buku kas tersinkronisasi persisten dan real-time ke database cloud.
          </p>
          <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-700">
            <span>Perumahan Saung Kebun</span>
            <span className="font-mono font-semibold">{totalWarga} Kavling Sync</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
