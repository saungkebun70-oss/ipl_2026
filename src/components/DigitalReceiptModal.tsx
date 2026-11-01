import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Send, ShieldCheck, Check, Building2 } from 'lucide-react';
import { Transaction, Resident } from '../types';
import { formatRupiah, formatDateIndo } from '../lib/api';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  resident?: Resident | null;
}

function terbilang(nominal: number): string {
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
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  resident
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && transaction && qrCanvasRef.current) {
      const verifyUrl = `https://saungkebun.id/verify/${transaction.noKwitansi || transaction.nomorTransaksi}`;
      QRCode.toCanvas(qrCanvasRef.current, verifyUrl, {
        width: 90,
        margin: 1,
        color: { dark: '#064e3b', light: '#ffffff' }
      });
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const targetName = transaction.namaWarga || resident?.nama || 'Warga Saung Kebun';
  const targetBlok = transaction.blokWarga || resident?.blok || '-';
  const terbilangStr = terbilang(transaction.nominal) + ' Rupiah';

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = resident?.noWhatsapp
    ? (resident.noWhatsapp.startsWith('0') ? '62' + resident.noWhatsapp.slice(1) : resident.noWhatsapp)
    : '';

  const waShareUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
        `🏛️ *BUKTI TANDA TERIMA IPL SAUNG KEBUN*\nNo. Kwitansi: *${transaction.noKwitansi || transaction.nomorTransaksi}*\nNama: ${targetName} (${targetBlok})\nJumlah: ${formatRupiah(transaction.nominal)}\nStatus: LUNAS & DIVERIFIKASI RESMI PENGURUS SAUNG KEBUN\nKetua: Bp. Erlangga · Bendahara: Bp. Andriansyah`
      )}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `🏛️ *BUKTI TANDA TERIMA IPL SAUNG KEBUN*\nNo. Kwitansi: *${transaction.noKwitansi || transaction.nomorTransaksi}*\nNama: ${targetName} (${targetBlok})\nJumlah: ${formatRupiah(transaction.nominal)}\nStatus: LUNAS & DIVERIFIKASI RESMI PENGURUS SAUNG KEBUN\nKetua: Bp. Erlangga · Bendahara: Bp. Andriansyah`
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kwitansi Resmi Terverifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable area) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white" id="printable-receipt">
          {/* Header Lembaga */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center relative">
            <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
              PAGUYUBAN WARGA
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase mt-0.5">
              PERUMAHAN SAUNG KEBUN
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Kelurahan Mustikajaya, Kota Bekasi, Jawa Barat 17158
            </p>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              SISTEM PENCATATAN IURAN PENGELOLAAN LINGKUNGAN (IPL) DIGITAL
            </div>
          </div>

          {/* Kwitansi Title & Number */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">NOMOR KWITANSI</span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {transaction.noKwitansi || transaction.nomorTransaksi}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">TANGGAL PEMBAYARAN</span>
              <span className="text-xs font-semibold text-slate-800">
                {formatDateIndo(transaction.tanggal)}
              </span>
            </div>
          </div>

          {/* Detail Rows */}
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Telah Diterima Dari</span>
              <span className="col-span-2 font-bold text-slate-900 text-sm">
                {targetName} <span className="font-mono text-emerald-700 font-semibold">(Blok {targetBlok})</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Uang Sejumlah</span>
              <div className="col-span-2">
                <div className="font-mono font-extrabold text-base text-emerald-700">
                  {formatRupiah(transaction.nominal)}
                </div>
                <div className="text-[11px] italic text-slate-600 capitalize mt-0.5">
                  ({terbilangStr})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Untuk Pembayaran</span>
              <span className="col-span-2 font-semibold text-slate-900 leading-relaxed">
                {transaction.keterangan || `Iuran IPL Bulan ${transaction.bulanDibayar || 'November 2026'}`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Kanal Pembayaran</span>
              <span className="col-span-2 font-mono font-medium text-slate-800">
                {transaction.metodePembayaran || 'Digital QRIS / VA'} (Otomatis Terverifikasi)
              </span>
            </div>
          </div>

          {/* Allocation Breakdown Box */}
          <div className="mt-5 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-[11px] text-slate-700">
            <span className="font-bold text-emerald-900 block mb-1.5">
              Rincian Alokasi Dana Iuran:
            </span>
            <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              <span>• Pos Keamanan & Satpam 24 Jam: <strong>Rp 65.000</strong></span>
              <span>• Truk Sampah Lingkungan: <strong>Rp 45.000</strong></span>
              <span>• Listrik PJU Jalan & Fasum: <strong>Rp 25.000</strong></span>
              <span>• Kas Sosial & Pemeliharaan: <strong>Rp 15.000</strong></span>
            </div>
          </div>

          {/* Signature & Seal Area */}
          <div className="mt-8 pt-4 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <canvas ref={qrCanvasRef} className="border border-slate-200 rounded p-1" />
              <div className="text-[10px] text-slate-500">
                <span className="font-bold text-emerald-800 block">DIGITALLY VERIFIED</span>
                <span>Pindai QR validasi keabsahan kas Saung Kebun.</span>
                <span className="block text-[9px] text-slate-400 mt-0.5">Ketua: Bp. Erlangga</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500">Bekasi, {formatDateIndo(transaction.tanggal)}</div>
              <div className="text-xs font-bold text-slate-900 mt-1">Bendahara Kas Saung Kebun</div>
              <div className="my-1.5 inline-block px-2.5 py-0.5 rounded border border-emerald-600 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                ✓ LUNAS
              </div>
              <div className="text-xs font-semibold text-slate-800">(Bp. Andriansyah)</div>
              <div className="text-[10px] text-slate-400">Blok B07/16</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <a
            href={waShareUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
