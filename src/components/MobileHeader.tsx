import React from 'react';
import { Building2, Bell, ShieldCheck, RefreshCw } from 'lucide-react';
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
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  waNotifCount,
  onOpenSwitchAccount,
  onOpenWhatsAppLogs,
  onOpenAuditLogs,
  onOpenArchitecture
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Brand Left */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate leading-tight">
                Saung Kebun
              </span>
              <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 shrink-0">
                IPL
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block truncate">
              Paguyuban Warga
            </span>
          </div>
        </div>

        {/* Right Actions & User Switch */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              aria-label="Arsitektur & Spesifikasi"
              className="p-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-[10px] font-bold border border-emerald-200 min-h-[38px] flex items-center gap-1"
            >
              <span>Arsitektur</span>
            </button>
          )}

          <button
            onClick={onOpenWhatsAppLogs}
            aria-label="Log WhatsApp"
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg relative min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {waNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={onOpenAuditLogs}
            aria-label="Audit Log"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSwitchAccount}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all border border-slate-200/70"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-2xs shrink-0 ${
              currentUser.role === 'KETUA'
                ? 'bg-purple-600'
                : currentUser.role === 'BENDAHARA'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}>
              {currentUser.role === 'WARGA' ? (currentUser.blok || 'W') : currentUser.role[0]}
            </div>
            <span className="text-xs font-semibold text-slate-800 max-w-[85px] sm:max-w-[120px] truncate">
              {currentUser.name.split(' ')[0]} {currentUser.blok ? `(${currentUser.blok})` : ''}
            </span>
            <RefreshCw className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
