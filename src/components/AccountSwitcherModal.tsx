import React, { useState } from 'react';
import { X, Search, CheckCircle2, UserCheck, Shield, KeyRound, Building, AlertCircle } from 'lucide-react';
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
  const [tab, setTab] = useState<'WARGA' | 'BENDAHARA' | 'KETUA'>('WARGA');
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
      setManualError(`Blok ${manualBlok} tidak terdaftar. Gunakan format seperti A-01, B-08, dll.`);
      return;
    }
    if (manualPin !== '1234' && target.pin !== manualPin) {
      setManualError('PIN salah! Gunakan PIN default: 1234');
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

  const handleSelectKetua = () => {
    onSelectUser({
      role: 'KETUA',
      name: 'Bp. Erlangga',
      title: 'Ketua Paguyuban Saung Kebun',
      blok: 'B03/07',
      phone: '081298765432'
    });
    onClose();
  };

  const handleSelectBendahara = () => {
    onSelectUser({
      role: 'BENDAHARA',
      name: 'Bp. Andriansyah',
      title: 'Bendahara Keuangan IPL Saung Kebun',
      blok: 'B07/16',
      phone: '081287654321'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ganti Akun Pengguna
            </h3>
            <p className="text-xs text-slate-500">
              Pilih peran akun (Ketua, Bendahara) atau salah satu dari 115 akun warga Saung Kebun
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200">
          <button
            onClick={() => setTab('WARGA')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              tab === 'WARGA'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Akun Warga (115 Unit)</span>
          </button>

          <button
            onClick={() => setTab('BENDAHARA')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              tab === 'BENDAHARA'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Bendahara Kas</span>
          </button>

          <button
            onClick={() => setTab('KETUA')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              tab === 'KETUA'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Ketua Paguyuban</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'WARGA' && (
            <div className="space-y-4">
              {/* Quick Blok & PIN direct login form */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  Masuk Mandiri dengan No. Blok & PIN (Semua Warga Terdaftar)
                </div>
                <form onSubmit={handleManualWargaLogin} className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[130px]">
                    <input
                      type="text"
                      placeholder="Contoh: A-05"
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
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
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
                    Atau Pilih Langsung Akun Warga ({filteredResidents.length} dari 115)
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

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {availableGroups.map(grp => (
                      <button
                        key={grp}
                        onClick={() => setSelectedGroup(grp)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                          selectedGroup === grp
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {grp === 'ALL' ? 'Semua' : grp === 'B8-Ext' ? 'Cadangan' : `Blok ${grp}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of residents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredResidents.map(res => {
                    const isCurrent = currentRole === 'WARGA' && currentResidentId === res.id;
                    return (
                      <button
                        key={res.id}
                        onClick={() => handlePickResident(res)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
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
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                    BD
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Bp. Andriansyah (Bendahara Kas Saung Kebun · Blok B07/16)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Wewenang mengelola pembukuan, mencatat pengeluaran operasional (satpam, sampah, PJU), verifikasi bukti pembayaran, dan broadcast pengingat WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Hak Akses:</span>
                  <span className="text-blue-700 font-bold">Administrator Keuangan Penuh</span>
                </div>
              </div>

              <button
                onClick={handleSelectBendahara}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Masuk Sebagai Bendahara Kas</span>
              </button>
            </div>
          )}

          {tab === 'KETUA' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold">
                    KT
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Bp. Erlangga (Ketua Paguyuban Saung Kebun · Blok B03/07)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Wewenang supervisi pengeluaran kas, monitoring tingkat kepatuhan warga, inspeksi audit trail transparansi, serta publikasi maklumat pengurus.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Hak Akses:</span>
                  <span className="text-purple-700 font-bold">Supervisi & Pengawasan Transparansi</span>
                </div>
              </div>

              <button
                onClick={handleSelectKetua}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Masuk Sebagai Ketua Paguyuban</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Perumahan Saung Kebun · Database Real-time Gratis</span>
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
