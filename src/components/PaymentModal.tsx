import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  CreditCard,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Resident, Transaction, WhatsAppNotification } from '../types';
import { formatRupiah, submitDigitalPayment } from '../lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  residents: Resident[];
  onPaymentSuccess: (data: { transaction: Transaction; resident: Resident; notification: WhatsAppNotification }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  resident,
  residents,
  onPaymentSuccess
}) => {
  const [selectedResidentId, setSelectedResidentId] = useState<string>(resident?.id || residents[0]?.id || '');
  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [method, setMethod] = useState<'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'EWALLET_GOPAY' | 'TRANSFER_MANUAL'>('QRIS');
  const [uniqueCode, setUniqueCode] = useState<number>(142);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultData, setResultData] = useState<{ transaction: Transaction; resident: Resident; notification: WhatsAppNotification } | null>(null);
  const [countdown, setCountdown] = useState<number>(899); // 14:59 min

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (resident) {
      setSelectedResidentId(resident.id);
    }
  }, [resident]);

  const currentResident = residents.find(r => r.id === selectedResidentId) || resident || residents[0];
  const monthlyRate = currentResident?.tagihanBulanan || 100000;
  const baseTotal = monthlyRate * monthsCount;
  // Apply 5% discount if paying 3 months or more in advance
  const discount = monthsCount >= 3 ? Math.round(baseTotal * 0.05) : 0;
  const totalAmount = baseTotal - discount + (method === 'QRIS' ? uniqueCode : 0);

  // Generate QR Code on canvas
  useEffect(() => {
    if (isOpen && method === 'QRIS' && canvasRef.current && currentResident) {
      const qrisString = `00020101021226610014ID.GO.QRIS.WWW01189360000000000000000215${currentResident.blok}0303UMI51440014ID.LINKAJA.WWW0215936000000000000520458125303360540${totalAmount}5802ID5920IPL SAUNG KEBUN RT046006BEKASI62140110IPL${currentResident.blok}6304`;
      QRCode.toCanvas(canvasRef.current, qrisString, {
        width: 190,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    }
  }, [isOpen, method, currentResident, totalAmount]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessPayment = async () => {
    if (!currentResident) return;
    setIsProcessing(true);

    try {
      const months = monthsCount === 1 ? ['November 2026'] : ['November 2026', 'Desember 2026', 'Januari 2027'];
      const res = await submitDigitalPayment({
        residentId: currentResident.id,
        months,
        amount: totalAmount,
        method,
        actorName: `${currentResident.nama} (${currentResident.blok})`,
        residentObj: currentResident
      });

      setResultData(res);
      setIsSuccess(true);
      onPaymentSuccess(res);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // gracefully ignore if canvas not supported
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setResultData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isSuccess ? 'Pembayaran Berhasil Diverifikasi' : 'Pembayaran Iuran IPL Digital'}
            </h3>
            <p className="text-xs text-slate-500">
              {isSuccess
                ? 'Kwitansi resmi telah diterbitkan dan tercatat pada kas Saung Kebun'
                : 'Sistem pembayaran digital resmi Perumahan Saung Kebun (Gratis Biaya Admin)'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {isSuccess && resultData ? (
            /* Success State */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  STATUS LUNAS · RESMI SAUNG KEBUN
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-2">
                  {formatRupiah(resultData.transaction.nominal)}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Nomor Kwitansi: <strong className="font-mono text-slate-800">{resultData.transaction.noKwitansi}</strong>
                </p>
              </div>

              {/* Detail Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pembayar</span>
                  <span className="font-semibold text-slate-900">{resultData.resident.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit Rumah</span>
                  <span className="font-mono font-bold text-slate-900">Blok {resultData.resident.blok}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar</span>
                  <span className="font-mono text-slate-900">{resultData.transaction.metodePembayaran}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Periode Dibayar</span>
                  <span className="font-medium text-emerald-800">{resultData.transaction.bulanDibayar}</span>
                </div>
              </div>

              {/* WhatsApp Notification Action */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">
                      Notifikasi WhatsApp Otomatis Siap Dikirim
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Kirimkan bukti tanda terima resmi langsung ke nomor WhatsApp warga ({resultData.resident.noWhatsapp}).
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={resultData.notification.directLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors text-center shadow-xs"
                  >
                    Kirim via WhatsApp
                  </a>
                  <button
                    onClick={() => handleCopy(resultData.notification.message)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Selesai & Lihat Dashboard
              </button>
            </div>
          ) : (
            /* Payment Process Form */
            <div className="space-y-4">
              {/* Resident Chooser */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Unit Rumah & Warga Saung Kebun
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>
                      Blok {r.blok} - {r.nama} ({r.tipeRumah} · {formatRupiah(r.tagihanBulanan)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration / Multi-month choice */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Periode Iuran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMonthsCount(1)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      monthsCount === 1
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">1 Bulan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">November 2026</div>
                    <div className="text-xs font-mono font-semibold text-emerald-700 mt-1">
                      {formatRupiah(monthlyRate)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMonthsCount(3)}
                    className={`p-3 rounded-xl border text-left transition-colors relative overflow-hidden ${
                      monthsCount === 3
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-bl">
                      HEMAT 5%
                    </span>
                    <div className="text-xs font-bold text-slate-900">3 Bulan Sekaligus</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Nov 2026 - Jan 2027</div>
                    <div className="text-xs font-mono font-semibold text-emerald-700 mt-1">
                      {formatRupiah(monthlyRate * 3 * 0.95)}
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Metode Pembayaran Digital
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'QRIS', label: 'QRIS Nasional', icon: QrCode },
                    { id: 'VA_BCA', label: 'BCA Virtual Account', icon: Building2 },
                    { id: 'VA_MANDIRI', label: 'Mandiri VA', icon: Building2 },
                    { id: 'VA_BRI', label: 'BRI Virtual Account', icon: Building2 },
                    { id: 'EWALLET_GOPAY', label: 'GoPay / DANA', icon: CreditCard },
                    { id: 'TRANSFER_MANUAL', label: 'Transfer Bank Manual', icon: Building2 },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                          isActive
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Detail Display based on method */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                {method === 'QRIS' && (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
                      <span>Batas Waktu Pembayaran:</span>
                      <span className="font-mono font-bold text-rose-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimer(countdown)}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl inline-block border border-slate-200 shadow-xs">
                      <canvas ref={canvasRef} className="mx-auto" />
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        NMID: ID102008492020 · SAUNG KEBUN
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      Scan kode QR di atas menggunakan aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, ShopeePay, DANA).
                    </div>
                  </div>
                )}

                {(method === 'VA_BCA' || method === 'VA_MANDIRI' || method === 'VA_BRI') && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-600">
                      Nomor Virtual Account {method.replace('VA_', '')} Resmi Saung Kebun:
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl font-mono text-sm">
                      <span className="font-bold text-slate-900 tracking-wider">
                        {method === 'VA_BCA' ? `88099120409${currentResident?.nomorRumah || '01'}` :
                         method === 'VA_MANDIRI' ? `89508120409${currentResident?.nomorRumah || '01'}` :
                         `12890120409${currentResident?.nomorRumah || '01'}`}
                      </span>
                      <button
                        onClick={() => handleCopy(
                          method === 'VA_BCA' ? `88099120409${currentResident?.nomorRumah || '01'}` :
                          method === 'VA_MANDIRI' ? `89508120409${currentResident?.nomorRumah || '01'}` :
                          `12890120409${currentResident?.nomorRumah || '01'}`
                        )}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 flex items-center gap-1 text-[11px]"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      *Nama rekening otomatis tertera: <strong className="text-slate-700">IPL Saung Kebun {currentResident?.blok}</strong>.
                    </p>
                  </div>
                )}

                {method === 'EWALLET_GOPAY' && (
                  <div className="text-xs text-slate-600 space-y-2">
                    <p>Pembayaran langsung ke kas Paguyuban Saung Kebun via ekosistem dompet digital terintegrasi.</p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs">
                      ID Tagihan: <span className="font-bold text-slate-900">EWL-SK-{currentResident?.blok}-{Date.now().toString().slice(-4)}</span>
                    </div>
                  </div>
                )}

                {method === 'TRANSFER_MANUAL' && (
                  <div className="text-xs text-slate-600 space-y-2">
                    <p>Transfer manual ke Rekening Resmi Kas Paguyuban:</p>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="font-semibold text-slate-900">Bank BCA: 880-991-2040</div>
                      <div className="text-slate-500 text-[11px]">a/n Paguyuban Warga Saung Kebun</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                  <span>Iuran {monthsCount} Bulan ({currentResident?.tipeRumah})</span>
                  <span className="font-mono">{formatRupiah(baseTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-700 mb-1">
                    <span>Diskon Pembayaran 3 Bulan (5%)</span>
                    <span className="font-mono">-{formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Tagihan Bersih</span>
                  <span className="font-mono text-emerald-700 text-base">{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              {/* Action Button: Simulate Instant Success */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Memverifikasi Pembayaran...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi Pembayaran Sukses (Simulasi Digital)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
