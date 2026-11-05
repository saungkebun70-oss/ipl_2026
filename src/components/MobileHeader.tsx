import React, { useState } from 'react';
import {
  Building2,
  Bell,
  ShieldCheck,
  RefreshCw,
  Share2,
  LogOut,
  MoreVertical,
  X,
  ExternalLink,
  Code2,
  Users,
  KeyRound,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { Role } from '../types';

interface MobileHeaderProps {
  currentUser: {
    role: Role;
    name: string;
    title: string;
    blok?: string;
  };
  waNotifCount: number;
  onOpenSwitchAccount: () => void;
  onOpenWhatsAppLogs: () => void;
  onOpenAuditLogs: () => void;
  onOpenArchitecture?: () => void;
  onOpenVercelDeploy?: () => void;
  onOpenShareApp?: () => void;
  onLogout?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  waNotifCount,
  onOpenSwitchAccount,
  onOpenWhatsAppLogs,
  onOpenAuditLogs,
  onOpenArchitecture,
  onOpenVercelDeploy,
  onOpenShareApp,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getRoleBadgeColor = () => {
    switch (currentUser.role) {
      case 'KETUA':
        return 'bg-purple-600 text-white';
      case 'BENDAHARA':
        return 'bg-blue-600 text-white';
      case 'KEAMANAN':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  const getRoleLabel = () => {
    if (currentUser.role === 'WARGA') {
      return currentUser.blok ? `Kavling ${currentUser.blok}` : 'Portal Warga';
    }
    if (currentUser.role === 'BENDAHARA') return 'Bendahara Kas';
    if (currentUser.role === 'KEAMANAN') return 'Pos Keamanan';
    return 'Ketua Paguyuban';
  };

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 py-2 w-full max-w-full">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Brand & Active Role Lockup */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                  Saung Kebun
                </span>
                <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 shrink-0">
                  IPL
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                </span>
                <span className="text-[10px] font-bold text-slate-600 truncate">
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Clean 3-Action Right Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Share Link */}
            {onOpenShareApp && (
              <button
                onClick={onOpenShareApp}
                aria-label="Bagikan Tautan"
                className="w-9 h-9 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200/70 transition-colors cursor-pointer"
                title="Bagikan Tautan Warga"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenWhatsAppLogs}
              aria-label="Log WhatsApp"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center relative transition-colors cursor-pointer"
              title="Notifikasi WhatsApp"
            >
              <Bell className="w-4 h-4" />
              {waNotifCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* User Profile Avatar Capsule */}
            <button
              onClick={onOpenSwitchAccount}
              className="flex items-center gap-1 pl-1 pr-2 py-1 bg-slate-100 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200 text-slate-800 cursor-pointer"
              title="Ganti Akun"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0 ${getRoleBadgeColor()}`}>
                {currentUser.role === 'WARGA'
                  ? (currentUser.blok ? currentUser.blok.split('/')[0].replace('B', '') : 'W')
                  : currentUser.role === 'KEAMANAN'
                  ? 'SC'
                  : currentUser.role === 'BENDAHARA'
                  ? 'BD'
                  : 'KT'}
              </div>
              <span className="text-[11px] font-bold max-w-[60px] truncate">
                {currentUser.blok || currentUser.name.split(' ')[0]}
              </span>
            </button>

            {/* More Menu Trigger (Drawer) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu Lainnya"
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Action Sheet Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />

            {/* User Account Info Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 ${getRoleBadgeColor()}`}>
                  {currentUser.role === 'WARGA'
                    ? (currentUser.blok || 'W')
                    : currentUser.role === 'BENDAHARA'
                    ? 'BD'
                    : currentUser.role === 'KEAMANAN'
                    ? 'SC'
                    : 'KT'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser.title}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSwitchAccount();
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600" />
                <span>Ganti</span>
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                Akses &amp; Utilitas Paguyuban
              </div>

              {onOpenShareApp && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenShareApp();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100/80 transition-colors border border-teal-200/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-teal-700" />
                    <span>Publikasi &amp; Bagikan Tautan Warga</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-teal-600 text-white rounded-full font-bold">Live</span>
                </button>
              )}

              {onOpenVercelDeploy && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenVercelDeploy();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 76 65" fill="none">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    <span>Deploy Vercel &amp; GitHub</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-white rounded-full font-bold">Auto</span>
                </button>
              )}

              {onOpenArchitecture && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenArchitecture();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>Spesifikasi Arsitektur &amp; Webhook</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAuditLogs();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Inspeksi Audit Trail Transparansi</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Immutable</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenWhatsAppLogs();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>Log Riwayat Pesan WhatsApp</span>
                </div>
                {waNotifCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                    {waNotifCount} Pesan
                  </span>
                )}
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer mt-2"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Keluar dari Akun Saat Ini</span>
                  </div>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
