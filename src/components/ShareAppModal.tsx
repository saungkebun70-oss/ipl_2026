import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageSquare,
  Globe,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
  Download,
  Info,
  Shield,
  KeyRound,
  Users
} from 'lucide-react';
import { Resident } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose, residents }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [selectedBlok, setSelectedBlok] = useState<string>('B03/01');
  const [copiedUnitLink, setCopiedUnitLink] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-pre-vzvdelmarjckvrvre247vh-697510650478.asia-southeast1.run.app';

  // Primary public access URL
  const publicAppUrl = currentOrigin;

  // 4 DEDICATED PORTAL LINKS
  const portalLinks = [
    {
      id: 'ketua',
      title: 'Link Khusus Ketua Paguyuban',
      recipient: 'Bp. Erlangga (Ketua Paguyuban · Blok B03/07)',
      url: `${publicAppUrl}/?role=ketua&pin=9999`,
      roleBadge: 'Supervisi & Eksekutif',
      color: 'purple',
      icon: Shield,
      pin: '9999',
      waNumber: '081298765432',
      desc: 'Langsung masuk otomatis ke Portal Ketua dengan wewenang supervisi kas, kepatuhan warga, inspeksi audit trail transparansi, dan persetujuan anggaran.',
      waMsg: `Assalamu'alaikum Wr. Wb. Bpk *Erlangga* (Ketua Paguyuban Saung Kebun),\n\nBerikut tautan akses khusus *Portal Ketua Paguyuban* untuk supervisi buku kas, pantau kepatuhan iuran 141 kavling, dan transparansi lingkungan:\n\n👑 *Portal*: Ketua Paguyuban\n🔑 *PIN*: 9999\n👉 *Tautan Langsung*: ${publicAppUrl}/?role=ketua&pin=9999\n\nCukup klik tautan di atas untuk masuk otomatis tanpa perlu login manual.`
    },
    {
      id: 'bendahara',
      title: 'Link Khusus Bendahara Kas',
      recipient: 'Bp. Andriansyah (Bendahara Keuangan · Blok B07/16)',
      url: `${publicAppUrl}/?role=bendahara&pin=8888`,
      roleBadge: 'Administrator Keuangan',
      color: 'blue',
      icon: KeyRound,
      pin: '8888',
      waNumber: '081287654321',
      desc: 'Langsung masuk otomatis ke Portal Bendahara untuk kasir setoran, pencatatan belanja (satpam, sampah, PJU), input pengeluaran, dan broadcast tagihan WhatsApp.',
      waMsg: `Assalamu'alaikum Wr. Wb. Bpk *Andriansyah* (Bendahara Kas Saung Kebun),\n\nBerikut tautan akses khusus *Portal Bendahara Keuangan* untuk mengelola pembukuan kas, kasir setoran, input belanja operasional, dan cetak kuitansi:\n\n💰 *Portal*: Bendahara Kas\n🔑 *PIN*: 8888\n👉 *Tautan Langsung*: ${publicAppUrl}/?role=bendahara&pin=8888\n\nCukup klik tautan di atas untuk masuk otomatis.`
    },
    {
      id: 'keamanan',
      title: 'Link Khusus Pos Keamanan & Satpam',
      recipient: 'Regu Satpam (Bp. Mulyono & Bp. Sugih · Pos Jaga Gerbang)',
      url: `${publicAppUrl}/?role=keamanan&pin=5555`,
      roleBadge: 'Pos Jaga 24 Jam',
      color: 'amber',
      icon: ShieldCheck,
      pin: '5555',
      waNumber: '081399887766',
      desc: 'Langsung masuk ke Portal Pos Jaga untuk pencatatan buku tamu, monitoring plat kendaraan keluar-masuk, kontak darurat warga, dan alarm panic button.',
      waMsg: `Selamat bertugas Petugas Keamanan Saung Kebun (Bp. Mulyono / Bp. Sugih),\n\nBerikut tautan akses khusus *Portal Pos Jaga & Keamanan 24 Jam*:\n\n🚨 *Portal*: Pos Jaga Satpam\n🔑 *PIN*: 5555\n👉 *Tautan Langsung*: ${publicAppUrl}/?role=keamanan&pin=5555\n\nGunakan untuk buku tamu digital, daftar kendaraan penghuni, dan koordinasi darurat.`
    },
    {
      id: 'warga',
      title: 'Link Khusus Portal Warga',
      recipient: 'Seluruh 141 Kavling Warga Perumahan Saung Kebun',
      url: `${publicAppUrl}/?role=warga`,
      roleBadge: 'Portal Publik Warga',
      color: 'emerald',
      icon: Building2,
      pin: '1234',
      waNumber: '',
      desc: 'Tautan resmi bagi warga perumahan untuk mengecek rincian iuran bulanan, status lunas/tunggakan, bayar via QRIS digital, dan unduh kwitansi ber-barcode.',
      waMsg: `📢 *PORTAL RESMI IPL WARGA SAUNG KEBUN* 📢\n\nYth. Bapak/Ibu Warga Saung Kebun,\n\nUntuk kemudahan cek iuran bulanan, status pembayaran, dan transparansi kas paguyuban, silakan akses portal resmi:\n\n🏠 *Portal Warga*: ${publicAppUrl}/?role=warga\n🔑 *PIN Standar Demo*: 1234\n\nCukup pilih nomor kavling Anda untuk melihat rincian iuran dan bayar via QRIS digital.`
    }
  ];

  // Selected resident for per-unit link
  const selectedResident = residents.find(r => r.blok === selectedBlok) || residents[0];
  const unitLoginUrl = `${publicAppUrl}?blok=${encodeURIComponent(selectedResident?.blok || 'B03/01')}&pin=${selectedResident?.pin || '1234'}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSendWa = (waNumber: string, message: string) => {
    const cleanPhone = waNumber.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const waUrl = waPhone
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendWaUnit = () => {
    if (!selectedResident) return;
    const msg = `Assalamu'alaikum Wr. Wb. / Salam Sejahtera Bpk/Ibu *${selectedResident.nama}* (Kavling *${selectedResident.blok}*),\n\nBerikut tautan akses langsung resmi akun SIPL Paguyuban Saung Kebun Anda:\n\n🏠 *Kavling*: ${selectedResident.blok}\n👤 *Nama*: ${selectedResident.nama}\n🔑 *PIN*: ${selectedResident.pin || '1234'}\n\n👉 *Klik Tautan Masuk Otomatis*:\n${unitLoginUrl}\n\nCukup klik tautan di atas untuk melihat status iuran, konfirmasi pembayaran, dan unduh kwitansi digital. Terima kasih!\n- *Pengurus Paguyuban Saung Kebun*`;
    const targetPhone = selectedResident.noWhatsapp.replace(/[^0-9]/g, '');
    const waPhone = targetPhone.startsWith('0') ? '62' + targetPhone.slice(1) : targetPhone;
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Globe className="w-3 h-3 text-emerald-400" />
              Tautan Multi-Portal Aktif 24/7
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              4 Portal Terpisah Otomatis
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            4 Link Khusus Portal Saung Kebun
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Kirimkan tautan khusus di bawah ini langsung via WhatsApp kepada Ketua, Bendahara, Pos Keamanan, dan Warga. Tautan ini dilengkapi kredensial otomatis sehingga pengguna langsung masuk ke portal masing-masing.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* ======================================================== */}
          {/* SECTION: 4 DEDICATED PORTAL CARDS                        */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                4 Tautan Khusus Siap Kirim (Ketua, Bendahara, Keamanan, Warga)
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">1-Klik Langsung Masuk</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {portalLinks.map((item) => {
                const Icon = item.icon;
                const isCopied = copiedKey === item.id;
                const badgeColor =
                  item.color === 'purple'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : item.color === 'blue'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : item.color === 'amber'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                const borderHover =
                  item.color === 'purple'
                    ? 'hover:border-purple-300'
                    : item.color === 'blue'
                    ? 'hover:border-blue-300'
                    : item.color === 'amber'
                    ? 'hover:border-amber-300'
                    : 'hover:border-emerald-300';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white transition-all shadow-xs flex flex-col justify-between ${borderHover}`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              item.color === 'purple'
                                ? 'bg-purple-600 text-white'
                                : item.color === 'blue'
                                ? 'bg-blue-600 text-white'
                                : item.color === 'amber'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate max-w-[190px]">
                              {item.recipient}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${badgeColor}`}>
                          {item.roleBadge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                        {item.desc}
                      </p>

                      {/* URL Box */}
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>URL Akses Langsung:</span>
                          <span className="font-mono font-bold text-slate-700">PIN: {item.pin}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-800 truncate select-all">
                          {item.url}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => copyToClipboard(item.url, item.id)}
                        className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                      </button>

                      <button
                        onClick={() => handleSendWa(item.waNumber, item.waMsg)}
                        className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Kirim ke WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Buka Link di Tab Baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION: PER-UNIT RESIDENT LINK GENERATOR                */}
          {/* ======================================================== */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Generator Link Warga Per-Kavling (Personal 1-Klik Masuk)
              </h3>
              <span className="text-[10px] text-slate-500">141 Unit Kavling</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Pilih Kavling Warga:
                </label>
                <select
                  value={selectedBlok}
                  onChange={(e) => setSelectedBlok(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.blok}>
                      {r.blok} - {r.nama} (WA: {r.noWhatsapp})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  PIN Akses Terdaftar:
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedResident?.pin || '1234'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="text-[11px] text-slate-500 truncate">
                Tautan Khusus Kavling: <span className="font-mono text-emerald-700 font-bold">{unitLoginUrl}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleSendWaUnit}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp Warga</span>
                </button>
                <button
                  onClick={() => copyToClipboard(unitLoginUrl, 'unit')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'unit' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'unit' ? 'Tersalin' : 'Salin Tautan'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Group Broadcast Announcement Draft */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                Draf Pesan Siaran WhatsApp Grup Paguyuban
              </h4>
              <button
                onClick={() => {
                  const msg = `📢 *PENGUMUMAN RESMI PAGUYUBAN WARGA SAUNG KEBUN* 📢\n\nAssalamu'alaikum Wr. Wb. & Salam Sejahtera,\nYth. Seluruh Bapak/Ibu Warga Perumahan Saung Kebun,\n\nUntuk mewujudkan transparansi tata kelola lingkungan dan mempermudah layanan iuran bulanan (IPL, Keamanan/Satpam, Sampah, dan PJU), pengurus telah meluncurkan sistem resmi:\n\n🌐 *Portal SIPL Saung Kebun (Online 24 Jam)*:\n👉 ${publicAppUrl}/?role=warga\n\n*Fitur Portal Warga:*\n✅ Cek status pembayaran iuran & tunggakan real-time\n✅ Bayar iuran mudah via QRIS & Virtual Account Bank\n✅ Unduh kwitansi resmi digital ber-barcode\n✅ Perbarui nomor WhatsApp mandiri\n✅ Pantau buku kas & transparansi pengeluaran paguyuban\n\nPIN standar: 1234.\n\n_Pengurus Paguyuban Saung Kebun_`;
                  copyToClipboard(msg, 'broadcast');
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedKey === 'broadcast' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'broadcast' ? 'Tersalin!' : 'Salin Pesan Siaran'}</span>
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {`📢 *PENGUMUMAN RESMI PAGUYUBAN WARGA SAUNG KEBUN* 📢\n\nYth. Bapak/Ibu Warga Perumahan Saung Kebun,\n\nSistem pembukuan dan portal iuran warga telah aktif 24 jam.\n👉 Link Portal Warga: ${publicAppUrl}/?role=warga\nPIN Default: 1234`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Semua tautan otomatis mengotentikasi peran pengguna ke Cloud Firestore.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
