import React from 'react';
import { X, MessageSquare, Send, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { WhatsAppNotification } from '../types';
import { formatDateTimeIndo } from '../lib/api';

interface WhatsAppLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: WhatsAppNotification[];
}

export const WhatsAppLogModal: React.FC<WhatsAppLogModalProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Notifikasi WhatsApp Otomatis
              </h3>
              <p className="text-xs text-slate-500">
                Sistem mengirimkan tanda terima transaksi dan pengingat tagihan langsung ke nomor warga
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

        {/* List of Notifications */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada notifikasi WhatsApp yang dikirimkan.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 bg-white hover:bg-emerald-50/20 transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{n.targetName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold">
                      Blok {n.targetBlok}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {n.targetPhone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTimeIndo(n.timestamp)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-slate-100">
                  {n.message}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Terkirim Otomatis ke Antrean WhatsApp
                  </span>

                  <a
                    href={n.directLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Buka Chat WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
          <span>Total {notifications.length} riwayat pesan tersimpan</span>
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
