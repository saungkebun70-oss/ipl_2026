import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  KeyRound,
  Send,
  Copy,
  Check,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Shield,
  Phone,
  Building,
  RefreshCw
} from 'lucide-react';
import { Resident, Role } from '../types';
import { updateResidentPin } from '../lib/api';

interface ResidentAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  currentRole: Role;
  adminName: string;
  onResidentUpdated: () => void;
}

export const ResidentAccountManagerModal: React.FC<ResidentAccountManagerModalProps> = ({
  isOpen,
  onClose,
  residents,
  currentRole,
  adminName,
  onResidentUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Edit PIN Modal State
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [newPin, setNewPin] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-pre-vzvdelmarjckvrvre247vh-697510650478.asia-southeast1.run.app';

  const availableGroups = ['ALL', 'B3', 'B5', 'B6', 'B7', 'B8', 'B8-Ext'];

  const filteredResidents = residents.filter(r => {
    const matchesGroup = selectedGroup === 'ALL' || r.blokGroup === selectedGroup;
    const matchesSearch =
      r.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.noWhatsapp.includes(searchQuery);
    return matchesGroup && matchesSearch;
  });

  const getAutoLoginLink = (res: Resident) => {
    return `${currentOrigin}?blok=${encodeURIComponent(res.blok)}&pin=${res.pin || '1234'}`;
  };

  const handleCopyLink = (res: Resident) => {
    const link = getAutoLoginLink(res);
    navigator.clipboard.writeText(link);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWaCredentials = (res: Resident) => {
    const link = getAutoLoginLink(res);
    const msg = `Assalamu'alaikum Wr. Wb. / Salam Sejahtera Bpk/Ibu *${res.nama}* (Kavling *${res.blok}*),\n\nBerikut adalah Kredensial Akun Resmi SIPL Paguyuban Saung Kebun yang diberikan oleh Pengurus:\n\n🏠 *Kavling*: Blok ${res.blok}\n👤 *Nama Kepala Keluarga*: ${res.nama}\n🔑 *PIN Masuk*: *${res.pin || '1234'}*\n\n👉 *Tautan Masuk Otomatis*:\n${link}\n\nMelalui portal ini, Anda dapat:\n✅ Memeriksa riwayat & status iuran bulanan\n✅ Melakukan konfirmasi/pembayaran iuran via QRIS & VA\n✅ Mengunduh kwitansi resmi digital\n✅ Memperbarui kontak WhatsApp mandiri\n\nSilakan simpan pesan ini. Terima kasih atas kerja samanya dalam memajukan lingkungan Saung Kebun.\n\nSalam hangat,\n*${adminName}*\nPengurus Paguyuban Saung Kebun`;

    const targetPhone = res.noWhatsapp.replace(/[^0-9]/g, '');
    const waPhone = targetPhone.startsWith('0') ? '62' + targetPhone.slice(1) : targetPhone;
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyAllCredentials = () => {
    let text = `DAFTAR KREDENSIAL AKUN SIPL PAGUYUBAN SAUNG KEBUN (TOTAL: ${residents.length} UNIT)\n\n`;
    text += `No\tBlok\tNama Kepala Keluarga\tNo WhatsApp\tPIN\tTautan Masuk Otomatis\n`;
    residents.forEach((r, idx) => {
      text += `${idx + 1}\t${r.blok}\t${r.nama}\t${r.noWhatsapp}\t${r.pin || '1234'}\t${getAutoLoginLink(r)}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleOpenEditPin = (res: Resident) => {
    setEditingResident(res);
    setNewPin(res.pin || '1234');
    setPinSuccessMsg('');
    setPinErrorMsg('');
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;

    const trimmedPin = newPin.trim();
    if (trimmedPin.length < 4) {
      setPinErrorMsg('PIN minimal harus terdiri dari 4 digit angka/karakter.');
      return;
    }

    setIsSavingPin(true);
    setPinErrorMsg('');
    setPinSuccessMsg('');

    try {
      await updateResidentPin(
        editingResident.id,
        trimmedPin,
        editingResident.nama,
        editingResident.blok,
        adminName,
        currentRole
      );
      setPinSuccessMsg(`PIN akun warga Blok ${editingResident.blok} berhasil diperbarui menjadi ${trimmedPin}`);
      onResidentUpdated();
      setTimeout(() => {
        setEditingResident(null);
      }, 1200);
    } catch (err: any) {
      setPinErrorMsg(err.message || 'Gagal memperbarui PIN.');
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <KeyRound className="w-3 h-3 text-blue-400" />
              Manajemen Kredensial Warga
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
              Total {residents.length} Kavling Terdaftar
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Distribusi Akun &amp; Kredensial Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Admin dapat memberikan akun resmi ke setiap warga, menyalin tautan masuk otomatis per kavling, atau mengirimkan kredensial langsung via pesan WhatsApp resmi.
          </p>
        </div>

        {/* Filter & Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Blok (B3/01), nama, no. WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Bulk Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyAllCredentials}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4 text-white" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>{copiedAll ? 'Semua Akun Tersalin!' : 'Salin Semua 141 Akun (Format Teks/Excel)'}</span>
              </button>
            </div>
          </div>

          {/* Block Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">Blok:</span>
            {availableGroups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-all ${
                  selectedGroup === grp
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {grp === 'ALL' ? 'Semua Blok (141)' : `Blok ${grp}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Blok / Kavling</th>
                  <th className="py-2.5 px-3">Nama Kepala Keluarga</th>
                  <th className="py-2.5 px-3">No. WhatsApp</th>
                  <th className="py-2.5 px-3 w-28 text-center">PIN Akses</th>
                  <th className="py-2.5 px-3 text-right">Aksi Distribusi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada warga yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((res, idx) => (
                    <tr key={res.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70">
                          {res.blok}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {res.nama}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {res.noWhatsapp !== '-' ? res.noWhatsapp : <span className="text-slate-400 italic">Belum diisi</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold">
                          <span>{res.pin || '1234'}</span>
                          <button
                            onClick={() => handleOpenEditPin(res)}
                            title="Ubah PIN Warga"
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer ml-1"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyLink(res)}
                            title="Salin Tautan Masuk Otomatis"
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {copiedId === res.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin Link</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleSendWaCredentials(res)}
                            title="Kirim Kredensial Resmi via WhatsApp"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim WA</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>PIN Default adalah <strong>1234</strong>. Perubahan PIN langsung tercatat di Audit Log Paguyuban.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Mini Modal: Edit PIN Warga */}
      {editingResident && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ubah PIN Akses Warga</h4>
                <p className="text-[11px] text-slate-500">
                  Unit {editingResident.blok} - {editingResident.nama}
                </p>
              </div>
              <button
                onClick={() => setEditingResident(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pinSuccessMsg}</span>
              </div>
            )}

            {pinErrorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{pinErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  PIN Baru (Minimal 4 Angka / Karakter):
                </label>
                <input
                  type="text"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Misal: 1234 atau 5678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  PIN lama: <span className="font-mono font-bold">{editingResident.pin || '1234'}</span>
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPin}
                  className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  {isSavingPin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSavingPin ? 'Menyimpan...' : 'Simpan PIN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
