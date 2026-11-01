import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  QrCode,
  Download,
  Receipt,
  CreditCard,
  Building2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Phone,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  Lock,
  UserCheck,
  Printer,
  X,
  RefreshCw,
  Info
} from 'lucide-react';
import { Resident, Transaction } from '../types';

// ==========================================
// 1. PROPS INTERFACE & DEFAULT MOCK DATA
// ==========================================

export interface WargaPortalProps {
  currentResident?: Resident | null;
  residents?: Resident[];
  transactions?: Transaction[];
  onSelectResident?: (resident: Resident) => void;
  onOpenPayModal?: (resident: Resident) => void;
  onOpenReceipt?: (tx: Transaction) => void;
  onOpenSwitchAccount?: () => void;
}

// Built-in standalone demo profiles to ensure the component is 100% self-contained
const DEMO_RESIDENTS: Resident[] = [
  {
    id: 'res-b3-01',
    blok: 'B03/01',
    blokGroup: 'B3',
    nomorRumah: '01',
    nama: 'ASEP SUKARMA',
    noWhatsapp: '0812-8800-1001',
    statusHunian: 'Dihuni Tetap',
    tipeRumah: 'Standar',
    tagihanBulanan: 100000,
    statusBulanIni: 'Lunas',
    bulanMenunggak: [],
    totalTunggakan: 0,
    lastPaymentDate: '2026-09-05T09:15:00Z',
    pin: '1234'
  },
  {
    id: 'res-b3-15',
    blok: 'B03/15',
    blokGroup: 'B3',
    nomorRumah: '15',
    nama: 'WENDY ROCHIMAT S',
    noWhatsapp: '081234567815',
    statusHunian: 'Dihuni Tetap',
    tipeRumah: 'Standar',
    tagihanBulanan: 100000,
    statusBulanIni: 'Menunggak',
    bulanMenunggak: ['Juni 2026', 'Juli 2026', 'Agustus 2026', 'September 2026'],
    totalTunggakan: 400000,
    pin: '1234'
  },
  {
    id: 'res-b3-07',
    blok: 'B03/07',
    blokGroup: 'B3',
    nomorRumah: '07',
    nama: 'DION YULIANA (BP ERLANGGA - KETUA)',
    noWhatsapp: '081298765432',
    statusHunian: 'Dihuni Tetap',
    tipeRumah: 'Standar',
    tagihanBulanan: 100000,
    statusBulanIni: 'Lunas',
    bulanMenunggak: [],
    totalTunggakan: 0,
    lastPaymentDate: '2026-09-05T08:30:00Z',
    pin: '1234'
  }
];

// Helper formatting utilities
const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const terbilang = (nominal: number): string => {
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (nominal < 12) return angka[nominal];
  if (nominal < 20) return terbilang(nominal - 10) + ' Belas';
  if (nominal < 100) return terbilang(Math.floor(nominal / 10)) + ' Puluh ' + angka[nominal % 10];
  if (nominal < 200) return 'Seratus ' + terbilang(nominal - 100);
  if (nominal < 1000) return terbilang(Math.floor(nominal / 100)) + ' Ratus ' + terbilang(nominal % 100);
  if (nominal < 2000) return 'Seribu ' + terbilang(nominal - 1000);
  if (nominal < 1000000) return terbilang(Math.floor(nominal / 1000)) + ' Ribu ' + terbilang(nominal % 1000);
  if (nominal < 1000000000) return terbilang(Math.floor(nominal / 1000000)) + ' Juta ' + terbilang(nominal % 1000000);
  return `${nominal}`;
};

// ==========================================
// 2. MAIN RESIDENT E-CARD & LEDGER PORTAL
// ==========================================

export const WargaPortal: React.FC<WargaPortalProps> = ({
  currentResident: propResident,
  residents = DEMO_RESIDENTS,
  transactions: propTransactions = [],
  onSelectResident,
  onOpenPayModal,
  onOpenReceipt,
  onOpenSwitchAccount
}) => {
  // Active resident state with fallback to demo profile
  const [internalResident, setInternalResident] = useState<Resident>(
    propResident || DEMO_RESIDENTS[0]
  );

  // Sync when propResident changes
  useEffect(() => {
    if (propResident) {
      setInternalResident(propResident);
    }
  }, [propResident]);

  const activeUnit = propResident || internalResident;

  // Privacy Toggle: show/hide rupiah balance on E-Card
  const [isNominalVisible, setIsNominalVisible] = useState<boolean>(true);

  // Year filter for 12-Month Ledger
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Standalone QRIS Modal State
  const [isQRISModalOpen, setIsQRISModalOpen] = useState<boolean>(false);
  const [qrisCountdown, setQrisCountdown] = useState<number>(899); // 14:59 min
  const [isCopiedRef, setIsCopiedRef] = useState<boolean>(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);

  // Standalone Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Canvas refs for dynamic QR rendering
  const qrisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const receiptCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Local simulated ledger overrides for active unit
  const [unitPaymentOverrides, setUnitPaymentOverrides] = useState<Record<string, boolean>>({});

  const isCurrentMonthPaid =
    unitPaymentOverrides[activeUnit.id] !== undefined
      ? unitPaymentOverrides[activeUnit.id]
      : activeUnit.statusBulanIni === 'Lunas';

  // Countdown timer effect for QRIS modal
  useEffect(() => {
    if (!isQRISModalOpen) return;
    const timer = setInterval(() => {
      setQrisCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isQRISModalOpen]);

  // Render QRIS Canvas when modal opens
  useEffect(() => {
    if (isQRISModalOpen && qrisCanvasRef.current) {
      const qrisPayload = `00020101021226680016ID.CO.MIDTRANS01189360000201100000000215SK-IPL-${activeUnit.blok.replace(/[^A-Za-z0-9]/g, '')}-202611520458125303360540${activeUnit.tagihanBulanan + 142}5802ID5919SIPL SAUNG KEBUN6008BEKASI62200716INV-SK-20261101630487E1`;
      QRCode.toCanvas(qrisCanvasRef.current, qrisPayload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    }
  }, [isQRISModalOpen, activeUnit]);

  // Render Receipt QR code
  useEffect(() => {
    if (isReceiptModalOpen && receiptCanvasRef.current && receiptData) {
      const verifyUrl = `https://saungkebun.id/verify/${receiptData.nomorKwitansi}`;
      QRCode.toCanvas(receiptCanvasRef.current, verifyUrl, {
        width: 100,
        margin: 1,
        color: {
          dark: '#064e3b',
          light: '#ffffff'
        }
      });
    }
  }, [isReceiptModalOpen, receiptData]);

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Switch demo profile
  const handleSwitchProfile = (res: Resident) => {
    setInternalResident(res);
    if (onSelectResident) {
      onSelectResident(res);
    }
  };

  // Trigger payment action
  const handlePayClick = () => {
    if (onOpenPayModal) {
      onOpenPayModal(activeUnit);
    } else {
      setQrisCountdown(899);
      setIsQRISModalOpen(true);
    }
  };

  // Trigger receipt view
  const handleViewReceipt = (monthName: string, amount: number, dateStr: string) => {
    const kwitansiNumber = `KW/SK/${selectedYear}/${activeUnit.blok.replace('/', '')}-${monthName.substring(0, 3).toUpperCase()}`;
    const txObj = {
      nomorKwitansi: kwitansiNumber,
      nomorTransaksi: `TRX-${selectedYear}-${activeUnit.blok.replace('/', '')}`,
      tanggal: dateStr,
      namaWarga: activeUnit.nama,
      blokWarga: activeUnit.blok,
      bulan: `${monthName} ${selectedYear}`,
      nominal: amount,
      metode: 'QRIS Dinamis (Midtrans Real-time)',
      penanggungJawab: 'Bp. Andriansyah (Bendahara)'
    };

    if (onOpenReceipt) {
      onOpenReceipt({
        id: `tx-${activeUnit.id}-${monthName}`,
        nomorTransaksi: txObj.nomorTransaksi,
        noKwitansi: txObj.nomorKwitansi,
        tanggal: dateStr,
        tipe: 'PEMASUKAN',
        kategori: `Iuran IPL ${monthName} ${selectedYear}`,
        nominal: amount,
        keterangan: `Pembayaran IPL ${monthName} ${selectedYear} Unit ${activeUnit.blok}`,
        wargaId: activeUnit.id,
        namaWarga: activeUnit.nama,
        blokWarga: activeUnit.blok,
        bulanDibayar: `${monthName} ${selectedYear}`,
        metodePembayaran: 'QRIS',
        penanggungJawab: 'Bp. Andriansyah',
        status: 'BERHASIL'
      });
    } else {
      setReceiptData(txObj);
      setIsReceiptModalOpen(true);
    }
  };

  // Simulate Instant Webhook Settlement for this unit
  const handleSimulateWebhookSettlement = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      setIsQRISModalOpen(false);
      setUnitPaymentOverrides(prev => ({
        ...prev,
        [activeUnit.id]: true
      }));

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Open digital receipt
      handleViewReceipt('November', activeUnit.tagihanBulanan, new Date().toISOString());
    }, 1200);
  };

  // Generate 12 months dataset strictly isolated for the active unit
  const monthsData = [
    { name: 'Januari', monthIdx: 1, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '05 Jan 2026, 09:12 WIB', method: 'QRIS Dinamis' },
    { name: 'Februari', monthIdx: 2, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '04 Feb 2026, 14:30 WIB', method: 'BCA Virtual Account' },
    { name: 'Maret', monthIdx: 3, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '06 Mar 2026, 10:05 WIB', method: 'QRIS Dinamis' },
    { name: 'April', monthIdx: 4, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '03 Apr 2026, 11:42 WIB', method: 'QRIS Dinamis' },
    { name: 'Mei', monthIdx: 5, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '07 Mei 2026, 08:21 WIB', method: 'Mandiri VA' },
    { name: 'Juni', monthIdx: 6, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '04 Jun 2026, 19:10 WIB', method: 'QRIS Dinamis' },
    { name: 'Juli', monthIdx: 7, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '05 Jul 2026, 13:18 WIB', method: 'Kas Tunai Bendahara' },
    { name: 'Agustus', monthIdx: 8, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '03 Agu 2026, 09:50 WIB', method: 'QRIS Dinamis' },
    { name: 'September', monthIdx: 9, baseAmount: activeUnit.tagihanBulanan, isPaid2026: true, paidDate: '04 Sep 2026, 16:04 WIB', method: 'GoPay QRIS' },
    { name: 'Oktober', monthIdx: 10, baseAmount: activeUnit.tagihanBulanan, isPaid2026: activeUnit.blok === 'B05/21' ? false : true, paidDate: '05 Okt 2026, 10:11 WIB', method: 'QRIS Dinamis' },
    { name: 'November', monthIdx: 11, baseAmount: activeUnit.tagihanBulanan, isPaid2026: isCurrentMonthPaid, paidDate: isCurrentMonthPaid ? '03 Nov 2026, 09:15 WIB' : '-', method: isCurrentMonthPaid ? 'QRIS Dinamis' : '-' },
    { name: 'Desember', monthIdx: 12, baseAmount: activeUnit.tagihanBulanan, isPaid2026: false, isUpcoming: true, paidDate: '-', method: '-' }
  ];

  // Calculate year stats for the unit
  const paidMonthsCount = monthsData.filter(m => m.isPaid2026).length;
  const totalPaidYear = paidMonthsCount * activeUnit.tagihanBulanan;
  const pendingMonths = monthsData.filter(m => !m.isPaid2026 && !m.isUpcoming);
  const totalTunggakanYear = pendingMonths.length * activeUnit.tagihanBulanan;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================= */}
      {/* A. MULTI-USER DEMO SWITCHER & PRIVACY ISOLATION BANNER   */}
      {/* ========================================================= */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Strict Privacy Isolation & Demo Switcher
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  RLS::ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Warga hanya memiliki hak akses baca terhadap data unitnya sendiri. Ganti profil di bawah untuk memverifikasi isolasi data instan:
              </p>
            </div>
          </div>

          {/* Quick Demo Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => handleSwitchProfile(DEMO_RESIDENTS[0])}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeUnit.blok === 'B03/01'
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Unit B03/01 (Lunas)</span>
            </button>

            <button
              onClick={() => handleSwitchProfile(DEMO_RESIDENTS[1])}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeUnit.blok === 'B05/21'
                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unit B05/21 (Belum Bayar)</span>
            </button>

            {onOpenSwitchAccount && (
              <button
                onClick={onOpenSwitchAccount}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                title="Pilih dari 115 Warga"
              >
                Lainnya...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* B. DIGITAL E-CARD IURAN BULANAN (LUXURY FINTECH PASS)     */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-emerald-950 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-emerald-900/40">
        {/* Card Background Ambient Patterns */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        
        {/* Subtle Watermark Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col justify-between min-h-[290px] gap-6">
          {/* Card Top Row: Estate Logo, EMV Chip & NFC */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white uppercase">
                    Perumahan Saung Kebun
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    <Sparkles className="w-2.5 h-2.5" />
                    RESMI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 font-mono tracking-wide">
                  Kartu Iuran Pengelolaan Lingkungan (IPL)
                </p>
              </div>
            </div>

            {/* Smart EMV Chip & Contactless Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Metallic Chip Visual */}
              <div className="w-12 h-9 rounded-lg bg-linear-to-tr from-amber-400 via-amber-200 to-amber-500 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-linear-to-br from-amber-500/90 to-amber-700/90 rounded-[6px] grid grid-cols-2 grid-rows-2 gap-[2px] p-1 border border-amber-300/60">
                  <div className="border-r border-b border-amber-300/40 rounded-tl-[2px]" />
                  <div className="border-l border-b border-amber-300/40 rounded-tr-[2px]" />
                  <div className="border-r border-t border-amber-300/40 rounded-bl-[2px]" />
                  <div className="border-l border-t border-amber-300/40 rounded-br-[2px]" />
                </div>
              </div>

              {/* NFC Contactless Wave Visual */}
              <svg className="w-6 h-6 text-emerald-400/80 -rotate-90 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
          </div>

          {/* Card Middle Row: Resident Unit Identity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end my-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300/80">
                  Unit Terdaftar
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Terverifikasi
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                  {activeUnit.blok}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/10 font-medium">
                  {activeUnit.tipeRumah}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-200 mt-1 truncate">
                {activeUnit.nama}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                WA: {activeUnit.noWhatsapp}
              </div>
            </div>

            {/* Bill Amount & Status Indicator */}
            <div className="sm:text-right flex flex-col sm:items-end">
              <div className="flex items-center sm:justify-end gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300">
                  Tagihan: November 2026
                </span>
                {/* Privacy Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setIsNominalVisible(!isNominalVisible)}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  title={isNominalVisible ? 'Sembunyikan Nominal' : 'Tampilkan Nominal'}
                >
                  {isNominalVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Masked / Unmasked Amount */}
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-300">
                {isNominalVisible ? (
                  formatRupiah(activeUnit.tagihanBulanan)
                ) : (
                  <span className="tracking-widest text-slate-400">Rp ••••••••</span>
                )}
              </div>

              {/* Visual Status Pill */}
              <div className="mt-2.5">
                {isCurrentMonthPaid ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>LUNAS TERCATAT</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs font-bold shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>BELUM DIBAYAR</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Bottom Row: Virtual Card Number & Direct Integrated Actions */}
          <div className="pt-4 border-t border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-300/60 tracking-widest">
              <span>••••</span>
              <span>••••</span>
              <span>2026</span>
              <span className="text-white font-bold">{activeUnit.blok.replace(/[^A-Za-z0-9]/g, '')}</span>
            </div>

            {/* Direct Action Trigger */}
            <div className="flex items-center gap-2">
              {isCurrentMonthPaid ? (
                <button
                  type="button"
                  onClick={() => handleViewReceipt('November', activeUnit.tagihanBulanan, activeUnit.lastPaymentDate || new Date().toISOString())}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 shadow-xs hover:shadow-md"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Unduh E-Resi / Kuitansi Digital</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePayClick}
                  className="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Bayar via QRIS Dinamis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* C. 12-MONTH RESIDENT PAYMENT LEDGER (TAHUN BUKU)          */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Ledger Header with Year Filter Tabs */}
        <div className="p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Riwayat Setoran Mandiri (12 Bulan)
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Unit {activeUnit.blok}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data transaksi personal dan kuitansi digital resmi berstempel pengurus
            </p>
          </div>

          {/* Year Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setSelectedYear(2026)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 2026
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2026 (Tahun Berjalan)
            </button>
            <button
              onClick={() => setSelectedYear(2025)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 2025
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2025 (Arsip)
            </button>
          </div>
        </div>

        {/* Ledger Performance Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60 text-xs">
          <div className="p-4">
            <span className="text-slate-500 block text-[11px]">Total Disetor ({selectedYear})</span>
            <span className="text-base font-extrabold font-mono text-emerald-700 mt-0.5 block">
              {formatRupiah(totalPaidYear)}
            </span>
          </div>

          <div className="p-4">
            <span className="text-slate-500 block text-[11px]">Kepatuhan Iuran</span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-0.5 block">
              {paidMonthsCount}/12 Bulan
            </span>
          </div>

          <div className="p-4">
            <span className="text-slate-500 block text-[11px]">Sisa Tunggakan</span>
            <span className={`text-base font-extrabold font-mono mt-0.5 block ${
              totalTunggakanYear > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {formatRupiah(totalTunggakanYear)}
            </span>
          </div>

          <div className="p-4">
            <span className="text-slate-500 block text-[11px]">Status Rekening Unit</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{totalTunggakanYear === 0 ? 'Tertib & Lancar' : 'Ada Tagihan Aktif'}</span>
            </span>
          </div>
        </div>

        {/* 12 Months Cards Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {monthsData.map((item) => {
            const isLunas = item.isPaid2026;
            const isUpcoming = item.isUpcoming;

            return (
              <div
                key={item.name}
                className={`p-4 rounded-2xl border transition-all ${
                  isLunas
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                    : isUpcoming
                    ? 'bg-slate-50/60 border-slate-200/70 opacity-75'
                    : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-500">
                      Bulan #{item.monthIdx.toString().padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.name} {selectedYear}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  {isLunas ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Lunas
                    </span>
                  ) : isUpcoming ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Akan Datang
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Tertunggak
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 font-mono flex items-baseline justify-between mt-3 pt-2.5 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Nominal:</span>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(item.baseAmount)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Metode:</span>
                  <span className="font-medium text-slate-700">{item.method}</span>
                </div>

                {isLunas && (
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    Tgl: {item.paidDate}
                  </div>
                )}

                {/* Card Action */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between">
                  {isLunas ? (
                    <button
                      type="button"
                      onClick={() => handleViewReceipt(item.name, item.baseAmount, item.paidDate)}
                      className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Lihat e-Kwitansi</span>
                    </button>
                  ) : isUpcoming ? (
                    <span className="text-[11px] text-slate-400 italic text-center w-full py-1">
                      Belum jatuh tempo
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePayClick}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* D. RINCIAN ALOKASI IURAN (TRANSPARANSI KEUANGAN)          */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rincian Alokasi Iuran IPL ({formatRupiah(activeUnit.tagihanBulanan)}/bulan)
            </h3>
            <p className="text-xs text-slate-500">
              Transparansi pos pengeluaran dari setiap rupiah yang disetorkan warga
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            100% Transparan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
            <span className="text-xs text-slate-500 block font-medium">1. Keamanan 24 Jam</span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block">Rp 65.000</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Honor 2 satpam, portal & CCTV</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
            <span className="text-xs text-slate-500 block font-medium">2. Angkut Sampah & DLH</span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block">Rp 45.000</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Armada truk 3x seminggu</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
            <span className="text-xs text-slate-500 block font-medium">3. Listrik PJU & Fasum</span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block">Rp 25.000</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Penerangan jalan & pos satpam</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
            <span className="text-xs text-slate-500 block font-medium">4. Kas Paguyuban & Fogging</span>
            <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block">
              {activeUnit.tipeRumah === 'Hook' ? 'Rp 40.000' : 'Rp 15.000'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Perawatan taman & bansos</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* E. BANTUAN & KONTAK PENGURUS PAGUYUBAN                    */}
      {/* ========================================================= */}
      <div className="p-5 bg-linear-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Butuh Konfirmasi Khusus?</div>
            <div className="text-slate-600 text-xs mt-0.5">
              Bendahara: <span className="font-semibold text-slate-800">Bp. Andriansyah</span> (Blok B07/16) · Ketua: <span className="font-semibold text-slate-800">Bp. Erlangga</span> (Blok B03/07)
            </div>
          </div>
        </div>
        <a
          href="https://api.whatsapp.com/send?phone=6281287654321&text=Halo%20Bendahara%20IPL%20Saung%20Kebun%20(Bp.%20Andriansyah),%20saya%20warga%20ingin%20konfirmasi%20iuran"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 shadow-xs"
        >
          <span>Chat WhatsApp Bendahara</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ========================================================= */}
      {/* F. STANDALONE DYNAMIC QRIS MODAL POPUP                    */}
      {/* ========================================================= */}
      {isQRISModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">QRIS Dinamis Otomatis</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Midtrans Payment Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setIsQRISModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-4 text-center">
              {/* Unit & Nominal */}
              <div className="bg-slate-50 rounded-2xl p-3 mb-4 border border-slate-100 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Unit:</span>
                  <span className="font-bold text-slate-900">{activeUnit.blok} ({activeUnit.nama})</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono text-slate-700 font-semibold">SK-INV-202611-{activeUnit.blok.replace(/[^A-Za-z0-9]/g, '')}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Total Transfer:</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">
                    {formatRupiah(activeUnit.tagihanBulanan + 142)}
                  </span>
                </div>
              </div>

              {/* QR Canvas */}
              <div className="inline-block p-3 bg-white border-2 border-dashed border-emerald-300 rounded-2xl shadow-inner mb-3">
                <canvas ref={qrisCanvasRef} className="rounded-lg mx-auto" />
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-mono font-bold bg-amber-50 py-1.5 px-3 rounded-full w-max mx-auto border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                <span>Kedaluwarsa dalam {formatTimer(qrisCountdown)}</span>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                Scan kode QR di atas menggunakan BCA Mobile, Livin' Mandiri, GoPay, OVO, ShopeePay, atau aplikasi perbankan apa pun. Status tagihan akan otomatis LUNAS seketika begitu Anda transfer.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={handleSimulateWebhookSettlement}
                disabled={isSimulatingPayment}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSimulatingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Webhook Midtrans...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Simulasi Selesaikan Pembayaran</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsQRISModalOpen(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Tutup Sementara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* G. STANDALONE DIGITAL RECEIPT MODAL POPUP                 */}
      {/* ========================================================= */}
      {isReceiptModalOpen && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden relative">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-5 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                Kuitansi Iuran Pengelolaan Lingkungan
              </h3>
              <p className="text-xs text-slate-500 font-medium">Paguyuban Warga Perumahan Saung Kebun</p>
              <div className="mt-2 inline-block px-3 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold">
                No: {receiptData.nomorKwitansi}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Telah Terima Dari:</span>
                <span className="font-bold text-slate-900">{receiptData.namaWarga}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nomor Unit / Blok:</span>
                <span className="font-mono font-bold text-slate-900">{receiptData.blokWarga}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Keperluan Pembayaran:</span>
                <span className="font-semibold text-slate-900">Iuran IPL Periode {receiptData.bulan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kanal Pembayaran:</span>
                <span className="font-semibold text-slate-900">{receiptData.metode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Transaksi:</span>
                <span className="font-mono text-slate-800">{receiptData.tanggal}</span>
              </div>

              {/* Amount Highlight */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 mt-3 text-center">
                <span className="text-[11px] text-emerald-800 block uppercase font-mono tracking-wider">
                  Jumlah Yang Dibayar
                </span>
                <span className="text-xl font-black font-mono text-emerald-950 mt-0.5 block">
                  {formatRupiah(receiptData.nominal)}
                </span>
                <span className="text-[11px] text-emerald-700 italic block mt-1">
                  "{terbilang(receiptData.nominal)} Rupiah"
                </span>
              </div>
            </div>

            {/* Verification Signature & QR */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3">
                <canvas ref={receiptCanvasRef} className="rounded border border-slate-200" />
                <div>
                  <span className="font-bold text-slate-900 block">QR Verifikasi Sah</span>
                  <span className="text-slate-400 block text-[10px]">Tervalidasi di Buku Kas</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Bendahara Pengurus:</span>
                <span className="font-bold text-slate-900 block mt-1">Bp. Andriansyah</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Tanda Tangan Digital Resmi</span>
              </div>
            </div>

            {/* Print / Save button */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WargaPortal;
