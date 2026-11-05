import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Home,
  Receipt,
  Crown,
  Wallet,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  Building2,
  UserCheck,
  Shield,
  Car,
  AlertTriangle,
  Phone
} from 'lucide-react';
import { Role, AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenPayModal: () => void;
  userRole: Role;
  unpaidCount: number;
  onOpenSwitchAccount: () => void;
  onOpenWhatsAppLogs?: () => void;
  onOpenAuditLogs?: () => void;
  currentBlok?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenPayModal,
  userRole,
  unpaidCount,
  onOpenSwitchAccount,
  onOpenWhatsAppLogs,
  onOpenAuditLogs,
  currentBlok
}) => {
  // 1. NAVIGATION DOCK FOR ROLE: WARGA
  if (userRole === 'WARGA') {
    return (
      <nav
        aria-label="Navigasi Bawah Portal Warga"
        className="fixed bottom-0 left-0 right-0 w-full max-w-full z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 select-none overflow-hidden"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
          {/* Tab 1: Portal Rumah Saya */}
          <button
            onClick={() => setActiveTab('warga-portal')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
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
              Portal Saya
            </span>
          </button>

          {/* Tab 2: Kas Warga (Transparansi) */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
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
              Kas Warga
            </span>
          </button>

          {/* Tab 3: Center Direct CTA - Bayar IPL Cepat */}
          <button
            onClick={onOpenPayModal}
            aria-label="Bayar Iuran IPL Cepat"
            className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 ring-4 ring-white group-active:scale-95 transition-all">
              <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 mt-1">
              Bayar IPL
            </span>
          </button>

          {/* Tab 4: Database / Direktori Warga */}
          <button
            onClick={() => setActiveTab('residents')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
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
              Kavling
            </span>
          </button>

          {/* Tab 5: Akun Saya & Ganti Profil */}
          <button
            onClick={onOpenSwitchAccount}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-emerald-700 transition-all cursor-pointer"
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold font-mono">
                {currentBlok ? currentBlok.split('/')[0].replace('B', '') : 'W'}
              </div>
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Akun Saya
            </span>
          </button>
        </div>
      </nav>
    );
  }

  // 2. NAVIGATION DOCK FOR ROLE: BENDAHARA
  if (userRole === 'BENDAHARA') {
    return (
      <nav
        aria-label="Navigasi Bawah Portal Bendahara Kas"
        className="fixed bottom-0 left-0 right-0 w-full max-w-full z-40 lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-blue-900/50 shadow-2xl px-2 select-none overflow-hidden text-slate-300"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
          {/* Tab 1: Kasir Kas / Pembayaran */}
          <button
            onClick={() => setActiveTab('bendahara')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'bendahara'
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              {activeTab === 'bendahara' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Kasir Kas
            </span>
          </button>

          {/* Tab 2: Matriks Iuran 141 Kavling */}
          <button
            onClick={() => setActiveTab('residents')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'residents'
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <FileSpreadsheet className="w-5 h-5" />
              {unpaidCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-amber-500 text-slate-950 text-[8px] font-extrabold rounded-full">
                  {unpaidCount}
                </span>
              )}
              {activeTab === 'residents' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Matriks Iuran
            </span>
          </button>

          {/* Tab 3: Center Action - Buku Kas & Pengeluaran */}
          <button
            onClick={() => setActiveTab('overview')}
            aria-label="Buku Kas & Pengeluaran"
            className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ring-4 ring-slate-900 ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white shadow-blue-500/40 scale-105'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-600/30 group-active:scale-95'
            }`}>
              <Wallet className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-blue-300 mt-1">
              Buku Kas
            </span>
          </button>

          {/* Tab 4: Broadcast WA Pengingat Tagihan */}
          <button
            onClick={onOpenWhatsAppLogs}
            aria-label="Broadcast WhatsApp Tagihan"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Broadcast WA
            </span>
          </button>

          {/* Tab 5: Profil Akun Bendahara */}
          <button
            onClick={onOpenSwitchAccount}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                BD
              </div>
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Bendahara
            </span>
          </button>
        </div>
      </nav>
    );
  }

  // 3. NAVIGATION DOCK FOR ROLE: KEAMANAN (SATPAM & POS JAGA)
  if (userRole === 'KEAMANAN') {
    return (
      <nav
        aria-label="Navigasi Bawah Portal Keamanan & Pos Jaga"
        className="fixed bottom-0 left-0 right-0 w-full max-w-full z-40 lg:hidden bg-slate-950/95 backdrop-blur-md border-t border-amber-900/50 shadow-2xl px-2 select-none overflow-hidden text-slate-300"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
          {/* Tab 1: Pos Jaga & Buku Tamu */}
          <button
            onClick={() => setActiveTab('keamanan')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'keamanan'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Shield className="w-5 h-5" />
              {activeTab === 'keamanan' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Pos Jaga
            </span>
          </button>

          {/* Tab 2: Buku Tamu & Kendaraan */}
          <button
            onClick={() => setActiveTab('keamanan')}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
          >
            <div className="relative">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Buku Tamu
            </span>
          </button>

          {/* Tab 3: Center Action - Tombol Darurat / Panic Alert */}
          <button
            onClick={() => setActiveTab('keamanan')}
            aria-label="Panic Button Darurat"
            className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 ring-4 ring-slate-950 group-active:scale-95 transition-all">
              <AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-rose-400 mt-1">
              DARURAT
            </span>
          </button>

          {/* Tab 4: Kontak Interkom Kavling */}
          <button
            onClick={() => setActiveTab('residents')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'residents'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Phone className="w-5 h-5" />
              {activeTab === 'residents' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Kontak Warga
            </span>
          </button>

          {/* Tab 5: Profil Akun Satpam */}
          <button
            onClick={onOpenSwitchAccount}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold font-mono">
                SEC
              </div>
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              Satpam
            </span>
          </button>
        </div>
      </nav>
    );
  }

  // 4. NAVIGATION DOCK FOR ROLE: KETUA
  return (
    <nav
      aria-label="Navigasi Bawah Portal Ketua Paguyuban"
      className="fixed bottom-0 left-0 right-0 w-full max-w-full z-40 lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-purple-900/50 shadow-2xl px-2 select-none overflow-hidden text-slate-300"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
        {/* Tab 1: Supervisi & Maklumat */}
        <button
          onClick={() => setActiveTab('ketua')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
            activeTab === 'ketua'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Crown className="w-5 h-5" />
            {activeTab === 'ketua' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Supervisi
          </span>
        </button>

        {/* Tab 2: Laporan Kas & Transparansi */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'overview' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Laporan Kas
          </span>
        </button>

        {/* Tab 3: Center Action - Data Kavling & Sensus */}
        <button
          onClick={() => setActiveTab('residents')}
          aria-label="Data Sensus 141 Kavling"
          className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ring-4 ring-slate-900 ${
            activeTab === 'residents'
              ? 'bg-purple-500 text-white shadow-purple-500/40 scale-105'
              : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-600/30 group-active:scale-95'
          }`}>
            <Building2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[10px] font-bold text-purple-300 mt-1">
            Data Kavling
          </span>
        </button>

        {/* Tab 4: Audit Trail Transparansi */}
        <button
          onClick={onOpenAuditLogs}
          aria-label="Inspeksi Audit Trail"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-purple-400 transition-all cursor-pointer"
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Audit Log
          </span>
        </button>

        {/* Tab 5: Profil Akun Ketua */}
        <button
          onClick={onOpenSwitchAccount}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-purple-400 transition-all cursor-pointer"
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold font-mono">
              KT
            </div>
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            Ketua
          </span>
        </button>
      </div>
    </nav>
  );
};
