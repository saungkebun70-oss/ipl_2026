import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  UserCheck,
  Shield,
  KeyRound,
  Building,
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Resident, Role } from '../types';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  currentRole: Role;
  currentResidentId?: string;
  onSelectUser: (user: any) => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  residents,
  currentRole,
  currentResidentId,
  onSelectUser
}) => {
  const [tab, setTab] = useState<'WARGA' | 'BENDAHARA' | 'KETUA' | 'KEAMANAN'>(currentRole);

  React.useEffect(() => {
    if (isOpen) {
      setTab(currentRole);
      setBendaharaError('');
      setKetuaError('');
      setKeamananError('');
      setManualError('');
    }
  }, [isOpen, currentRole]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const availableGroups = React.useMemo(() => {
    const list = ['ALL'];
    const preferredOrder = ['B3', 'B5', 'B6', 'B7', 'B8', 'B8-Ext'];
    preferredOrder.forEach(grp => {
      if (residents.some(r => r.blokGroup === grp)) list.push(grp);
    });
    residents.forEach(r => {
      if (r.blokGroup && !list.includes(r.blokGroup)) list.push(r.blokGroup);
    });
    return list;
  }, [residents]);

  // Manual Warga Login inputs
  const [manualBlok, setManualBlok] = useState('');
  const [manualPin, setManualPin] = useState('1234');
  const [manualError, setManualError] = useState('');

  // Bendahara Portal Auth state
  const [bendaharaPin, setBendaharaPin] = useState('8888');
  const [bendaharaError, setBendaharaError] = useState('');

  // Ketua Portal Auth state
  const [ketuaPin, setKetuaPin] = useState('9999');
  const [ketuaError, setKetuaError] = useState('');

  // Keamanan Portal Auth state
  const [keamananPin, setKeamananPin] = useState('5555');
  const [keamananError, setKeamananError] = useState('');

  if (!isOpen) return null;

  const filteredResidents = residents.filter(r => {
    const matchesGroup = selectedGroup === 'ALL' || r.blokGroup === selectedGroup;
    const matchesSearch =
      r.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nomorRumah.includes(searchQuery);
    return matchesGroup && matchesSearch;
  });

  const handleManualWargaLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    const target = residents.find(r => r.blok.toUpperCase() === manualBlok.trim().toUpperCase());
    if (!target) {
      setManualError(`Blok ${manualBlok} tidak terdaftar. Gunakan format seperti B03/01, B05/21, dll.`);
      return;
    }
    if (manualPin !== '1234' && target.pin !== manualPin) {
      setManualError('PIN salah! Gunakan PIN standar demo: 1234');
      return;
    }

    onSelectUser({
      role: 'WARGA',
      residentId: target.id,
      name: target.nama,
      blok: target.blok,
      title: `Warga Blok ${target.blok}`,
      phone: target.noWhatsapp,
      resident: target
    });
    onClose();
  };

  const handlePickResident = (res: Resident) => {
    onSelectUser({
      role: 'WARGA',
      residentId: res.id,
      name: res.nama,
      blok: res.blok,
      title: `Warga Blok ${res.blok}`,
      phone: res.noWhatsapp,
      resident: res
    });
    onClose();
  };

  const handleSelectKetua = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setKetuaError('');
    if (ketuaPin.trim() !== '9999' && ketuaPin.trim() !== '1234') {
      setKetuaError('PIN Keamanan Ketua Paguyuban salah! (Gunakan 9999)');
      return;
    }

    onSelectUser({
      role: 'KETUA',
      name: 'Bp. Erlangga',
      title: 'Ketua Paguyuban Saung Kebun',
      blok: 'B03/07',
      phone: '081298765432'
    });
    onClose();
  };

  const handleSelectBendahara = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBendaharaError('');
    if (bendaharaPin.trim() !== '8888' && bendaharaPin.trim() !== '1234') {
      setBendaharaError('PIN Keamanan Bendahara Kas salah! (Gunakan 8888)');
      return;
    }

    onSelectUser({
      role: 'BENDAHARA',
      name: 'Bp. Andriansyah',
      title: 'Bendahara Keuangan IPL Saung Kebun',
      blok: 'B07/16',
      phone: '081287654321'
    });
    onClose();
  };

  const handleSelectKeamanan = (name = 'Bp. Mulyono', title = 'Komandan Satpam Saung Kebun') => {
    setKeamananError('');
    if (keamananPin.trim() !== '5555' && keamananPin.trim() !== '1234') {
      setKeamananError('PIN Pos Keamanan salah! (Gunakan 5555)');
      return;
    }

    onSelectUser({
      role: 'KEAMANAN',
      name,
      title,
      blok: 'POS-01',
      phone: '081399887766'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Pusat Portal &amp; Akun Terpisah
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Multi-Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap portal (Warga, Bendahara, Ketua, Keamanan) memiliki wewenang, sandi akses, dan akun terisolasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2x2 on mobile, 4-col on desktop Tab Switchers (Zero Scrollbar with Arrows!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 bg-slate-100/90 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('WARGA')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'WARGA'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Portal Warga</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('BENDAHARA')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'BENDAHARA'
                ? 'bg-white text-blue-800 shadow-sm border border-blue-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Portal Bendahara</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('KETUA')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'KETUA'
                ? 'bg-white text-purple-800 shadow-sm border border-purple-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="truncate">Portal Ketua</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('KEAMANAN')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'KEAMANAN'
                ? 'bg-white text-amber-800 shadow-sm border border-amber-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">Pos Keamanan</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === 'WARGA' && (
            <div className="space-y-4">
              {/* Portal Info Badge */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Portal Warga Saung Kebun (141 Kavling Mandiri)</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Setiap warga memiliki portal privat untuk melihat rincian iuran bulanan, kwitansi digital, tagihan lunas/tunggakan, serta pembayaran QRIS.
                  </div>
                </div>
              </div>

              {/* Quick Blok & PIN direct login form */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  Masuk Mandiri dengan No. Blok &amp; PIN
                </div>
                <form onSubmit={handleManualWargaLogin} className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[130px]">
                    <input
                      type="text"
                      placeholder="Contoh: B05/21 atau B03/01"
                      value={manualBlok}
                      onChange={(e) => setManualBlok(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="password"
                      placeholder="PIN (1234)"
                      value={manualPin}
                      onChange={(e) => setManualPin(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Masuk Akun
                  </button>
                </form>
                {manualError && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {manualError}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  *PIN default seluruh warga demo adalah <span className="font-mono font-bold text-slate-700">1234</span>
                </p>
              </div>

              {/* Resident selector with search & group filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Atau Pilih Langsung Akun Warga ({filteredResidents.length} dari {residents.length})
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari nama warga, no rumah, atau blok..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Smooth horizontal group carousel WITHOUT scrollbar */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0">
                    {availableGroups.map(grp => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedGroup(grp)}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                          selectedGroup === grp
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {grp === 'ALL' ? 'Semua' : grp === 'B8-Ext' ? 'Cadangan' : `Blok ${grp}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of residents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                  {filteredResidents.map(res => {
                    const isCurrent = currentRole === 'WARGA' && currentResidentId === res.id;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handlePickResident(res)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {res.blok}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {res.nama}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span>{res.tipeRumah}</span>
                              <span>·</span>
                              <span className={res.statusBulanIni === 'Lunas' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                                {res.statusBulanIni}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'BENDAHARA' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-blue-700/20">
                    BD
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Bp. Andriansyah
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Bendahara Kas
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kavling B07/16 · Wewenang mengelola buku kas, kasir pembayaran IPL, pencatatan belanja (satpam, sampah, PJU), rekonsiliasi bank, dan broadcast pengingat WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-blue-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Hak Akses:</span>
                  <span className="text-blue-700 font-bold">Administrator Keuangan Penuh</span>
                </div>
              </div>

              {/* Dedicated PIN Authentication for Bendahara Portal */}
              <form onSubmit={handleSelectBendahara} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>PIN Keamanan Portal Bendahara:</span>
                  </label>
                  <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    PIN Demo: 8888
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={bendaharaPin}
                    onChange={(e) => setBendaharaPin(e.target.value)}
                    placeholder="Masukkan PIN Bendahara..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Masuk Portal</span>
                  </button>
                </div>

                {bendaharaError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{bendaharaError}</span>
                  </p>
                )}
              </form>
            </div>
          )}

          {tab === 'KETUA' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/70">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-purple-700/20">
                    KT
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Bp. Erlangga
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        Ketua Paguyuban
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kavling B03/07 · Wewenang supervisi pengeluaran kas, monitoring tingkat kepatuhan warga, inspeksi audit trail transparansi, serta persetujuan anggaran dan publikasi maklumat.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-purple-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Hak Akses:</span>
                  <span className="text-purple-700 font-bold">Supervisi &amp; Pengawasan Transparansi</span>
                </div>
              </div>

              {/* Dedicated PIN Authentication for Ketua Portal */}
              <form onSubmit={handleSelectKetua} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>PIN Keamanan Portal Ketua:</span>
                  </label>
                  <span className="text-[10px] text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    PIN Demo: 9999
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={ketuaPin}
                    onChange={(e) => setKetuaPin(e.target.value)}
                    placeholder="Masukkan PIN Ketua..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Masuk Portal</span>
                  </button>
                </div>

                {ketuaError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{ketuaError}</span>
                  </p>
                )}
              </form>
            </div>
          )}

          {tab === 'KEAMANAN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-amber-700/20">
                    SEC
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Regu Satpam &amp; Pos Jaga 24 Jam
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pos Keamanan
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Wewenang pencatatan buku tamu &amp; kendaraan masuk, pembukaan portal gerbang, checklist ronda malam, pengaktifan alarm darurat (panic button), dan verifikasi kavling warga.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-amber-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Hak Akses:</span>
                  <span className="text-amber-800 font-bold">Operasional Pos Jaga &amp; Keamanan 24 Jam</span>
                </div>
              </div>

              {/* Dedicated PIN Authentication for Pos Keamanan */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>PIN Akses Pos Jaga Satpam:</span>
                  </label>
                  <span className="text-[10px] text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    PIN Demo: 5555
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={keamananPin}
                    onChange={(e) => setKeamananPin(e.target.value)}
                    placeholder="Masukkan PIN Pos Jaga..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {keamananError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{keamananError}</span>
                  </p>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectKeamanan('Bp. Mulyono', 'Komandan Regu Satpam Saung Kebun')}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Masuk: Bp. Mulyono (Komandan Satpam)</span>
                    </div>
                    <span className="text-[10px] bg-amber-700 px-2 py-0.5 rounded font-mono">Shift 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectKeamanan('Bp. Sugih', 'Petugas Gerbang & Portal Saung Kebun')}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Masuk: Bp. Sugih (Petugas Portal)</span>
                    </div>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded font-mono">Shift 2</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Perumahan Saung Kebun · Database Real-time Terpadu</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
