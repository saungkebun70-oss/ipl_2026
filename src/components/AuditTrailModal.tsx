import React from 'react';
import { X, ShieldCheck, Lock, Clock, FileCheck } from 'lucide-react';
import { AuditLog } from '../types';
import { formatDateTimeIndo } from '../lib/api';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Audit & Keamanan Transaksi (Tamper-Proof)
              </h3>
              <p className="text-xs text-slate-500">
                Catatan immutable aktivitas kas dan keamanan data seluruh warga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Setiap transaksi dilindungi hash integritas database server lokal tanpa biaya langganan cloud pihak ketiga.</span>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.actor}</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                      {log.role}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">
                      [{log.action}]
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {log.detail}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                  {formatDateTimeIndo(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
          <span>Menampilkan {logs.length} catatan audit log</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
