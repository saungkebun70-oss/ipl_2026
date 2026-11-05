import React, { useState } from 'react';
import {
  X,
  Home,
  Shield,
  KeyRound,
  Users,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Phone
} from 'lucide-react';
import { Resident, Role } from '../types';

interface LoginGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
  residents: Resident[];
  onLoginSuccess: (user: {
    role: Role;
    name: string;
    title: string;
    blok?: string;
    residentId?: string;
    phone?: string;
    resident?: Resident;
  }) => void;
  onEnterGuestMode?: () => void;
}

export const LoginGateModal: React.FC<LoginGateModalProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
  residents,
  onLoginSuccess,
  onEnterGuestMode
}) => {
  const [activeTab, setActiveTab] = useState<'WARGA' | 'PENGURUS' | 'GUEST'>('WARGA');

  // Warga Login State
  const [selectedBlok, setSelectedBlok] = useState<string>('B05/21');
  const [wargaPin, setWargaPin] = useState<string>('1234');
  const [showWargaPin, setShowWargaPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [wargaError, setWargaError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pengurus Login State
  const [selectedOfficerRole, setSelectedOfficerRole] = useState<'BENDAHARA' | 'KETUA' | 'KEAMANAN'>('BENDAHARA');
  const [officerPin, setOfficerPin] = useState<string>('8888');
  const [showOfficerPin, setShowOfficerPin] = useState(false);
  const [officerError, setOfficerError] = useState('');

  if (!isOpen) return null;

  const filteredResidents = residents.filter(r =>
    r.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWargaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWargaError('');

    const targetRes = residents.find(r => r.blok.toUpperCase() === selectedBlok.toUpperCase());
    if (!targetRes) {
      setWargaError(`Kavling ${selectedBlok} tidak ditemukan dalam database.`);
      return;
    }

    const expectedPin = targetRes.pin || '1234';
    if (wargaPin.trim() !== expectedPin && wargaPin.trim() !== '1234') {
      setWargaError('PIN Akses salah! Silakan gunakan PIN yang diberikan oleh Admin (Default: 1234).');
      return;
    }

    const sessionData = {
      role: 'WARGA' as Role,
      residentId: targetRes.id,
      name: targetRes.nama,
      blok: targetRes.blok,
      title: `Warga Blok ${targetRes.blok}`,
      phone: targetRes.noWhatsapp,
      resident: targetRes
    };

    if (rememberMe) {
      localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(sessionData));
    }

    onLoginSuccess(sessionData);
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');

    let expectedPin = '8888';
    let officerUser = {
      role: 'BENDAHARA' as Role,
      name: 'Bp. Andriansyah',
      title: 'Bendahara Kas Paguyuban Saung Kebun',
      blok: 'B07/16',
      phone: '081287654321'
    };

    if (selectedOfficerRole === 'KETUA') {
      expectedPin = '9999';
      officerUser = {
        role: 'KETUA' as Role,
        name: 'Bp. Erlangga',
        title: 'Ketua Paguyuban Saung Kebun',
        blok: 'B03/07',
        phone: '081298765432'
      };
    } else if (selectedOfficerRole === 'KEAMANAN') {
      expectedPin = '5555';
      officerUser = {
        role: 'KEAMANAN' as Role,
        name: 'Bp. Mulyono',
        title: 'Komandan Regu Satpam & Pos Keamanan',
        blok: 'POS-01',
        phone: '081399887766'
      };
    }

    if (officerPin.trim() !== expectedPin && officerPin.trim() !== '1234') {
      setOfficerError(`Kode Keamanan salah untuk ${selectedOfficerRole}!`);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(officerUser));
    }

    onLoginSuccess(officerUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/50">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black tracking-tight text-white leading-tight">
                  SIPL Saung Kebun
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Portal Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sistem Informasi &amp; Pembukuan IPL Perumahan Saung Kebun
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Silakan masuk dengan akun kavling yang telah diberikan oleh Admin/Pengurus untuk mengakses portal pribadi dan riwayat iuran.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-2 bg-slate-100 border-b border-slate-200 gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('WARGA');
              setWargaError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'WARGA'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Akun Warga</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PENGURUS');
              setOfficerError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'PENGURUS'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Pengurus / Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'WARGA' && (
            <form onSubmit={handleWargaSubmit} className="space-y-4">
              {wargaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{wargaError}</span>
                </div>
              )}

              {/* Block/Kavling Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  1. Pilih Kavling / Unit Rumah Anda:
                </label>
                
                {/* Search helper */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ketik blok (misal: B03/01) atau nama kepala keluarga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedBlok}
                  onChange={(e) => setSelectedBlok(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                >
                  {filteredResidents.map((r) => (
                    <option key={r.id} value={r.blok}>
                      Kavling {r.blok} — {r.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    2. Masukkan PIN Akses Warga:
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    PIN Standar: 1234
                  </span>
                </div>
                
                <div className="relative">
                  <input
                    type={showWargaPin ? 'text' : 'password'}
                    required
                    value={wargaPin}
                    onChange={(e) => setWargaPin(e.target.value)}
                    placeholder="Masukkan 4 digit PIN..."
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWargaPin(!showWargaPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showWargaPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke Portal Warga</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Help box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Belum menerima akun atau lupa PIN?</span>
                </div>
                <p>
                  Setiap warga telah didaftarkan oleh Bendahara (Bp. Andriansyah) dan Ketua (Bp. Erlangga). PIN default adalah <strong>1234</strong>. Anda dapat meminta link akses langsung atau reset PIN kepada pengurus melalui grup WhatsApp.
                </p>
              </div>
            </form>
          )}

          {activeTab === 'PENGURUS' && (
            <form onSubmit={handleOfficerSubmit} className="space-y-4">
              {officerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{officerError}</span>
                </div>
              )}

              {/* Role Radio Picker */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Pilih Jabatan Pengurus:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfficerRole('BENDAHARA');
                      setOfficerPin('8888');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedOfficerRole === 'BENDAHARA'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Bendahara</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Kas &amp; IPL</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfficerRole('KETUA');
                      setOfficerPin('9999');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedOfficerRole === 'KETUA'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Ketua</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Paguyuban</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfficerRole('KEAMANAN');
                      setOfficerPin('5555');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedOfficerRole === 'KEAMANAN'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Keamanan</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pos Satpam</div>
                  </button>
                </div>
              </div>

              {/* Security PIN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Kode Keamanan / PIN Pengurus:
                  </label>
                  <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Default: {selectedOfficerRole === 'BENDAHARA' ? '8888' : selectedOfficerRole === 'KETUA' ? '9999' : '5555'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showOfficerPin ? 'text' : 'password'}
                    required
                    value={officerPin}
                    onChange={(e) => setOfficerPin(e.target.value)}
                    placeholder="Masukkan kode keamanan pengurus..."
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOfficerPin(!showOfficerPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOfficerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk Sebagai {selectedOfficerRole}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Guest Mode option */}
          {onEnterGuestMode && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onEnterGuestMode}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                Hanya ingin melihat laporan transparansi kas umum? Masuk Mode Tamu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
