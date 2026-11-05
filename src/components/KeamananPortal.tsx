import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Car,
  UserCheck,
  AlertTriangle,
  Clock,
  Phone,
  Search,
  CheckCircle2,
  Plus,
  X,
  FileText,
  MessageSquare,
  Users,
  MapPin,
  Flame,
  Ambulance,
  Radio,
  Eye,
  LogOut,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Resident, GuestLog, PatrolLog, EmergencyAlert } from '../types';

interface KeamananPortalProps {
  residents: Resident[];
  currentGuardName?: string;
  onOpenSwitchAccount?: () => void;
}

export const KeamananPortal: React.FC<KeamananPortalProps> = ({
  residents,
  currentGuardName = 'Bp. Mulyono (Komandan Satpam)',
  onOpenSwitchAccount
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'TAMU' | 'DARURAT' | 'PATROLI' | 'VERIFIKASI'>('TAMU');

  // 1. Guest Log State (with localStorage cache)
  const [guestLogs, setGuestLogs] = useState<GuestLog[]>(() => {
    const saved = localStorage.getItem('saung_kebun_guest_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'gst-1',
        namaTamu: 'Bp. Hendra Kurniawan',
        jenisTamu: 'Tamu Keluarga',
        kendaraan: 'Mobil',
        platNomor: 'B 1892 KRF',
        blokTujuan: 'B07/16',
        keperluan: 'Silaturahmi keluarga Bp. Andriansyah',
        waktuMasuk: new Date(Date.now() - 45 * 60000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'DI_DALAM',
        petugasJaga: currentGuardName
      },
      {
        id: 'gst-2',
        namaTamu: 'Kurir J&T Cargo',
        jenisTamu: 'Kurir / Paket',
        kendaraan: 'Motor',
        platNomor: 'B 4821 SOX',
        blokTujuan: 'B05/21',
        keperluan: 'Kirim paket besar ke Bp. Hartono',
        waktuMasuk: new Date(Date.now() - 15 * 60000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'DI_DALAM',
        petugasJaga: currentGuardName
      },
      {
        id: 'gst-3',
        namaTamu: 'Teknisi Telkom IndiHome',
        jenisTamu: 'Tukang / Renovasi',
        kendaraan: 'Mobil',
        platNomor: 'B 2341 TKM',
        blokTujuan: 'B03/07',
        keperluan: 'Perbaikan fiber optik warga Bp. Erlangga',
        waktuMasuk: '09:15',
        waktuKeluar: '10:45',
        status: 'SUDAH_KELUAR',
        petugasJaga: 'Bp. Sugih'
      }
    ];
  });

  // 2. Patrol Log State
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>(() => {
    const saved = localStorage.getItem('saung_kebun_patrol_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'pt-1',
        waktu: '02:00 WIB',
        petugas: currentGuardName,
        rute: 'Pos Utama -> Blok B3 -> Blok B5 -> Taman Tengah',
        kondisi: 'Aman Terkendali',
        catatan: 'Portal tertutup terkunci rapat, penerangan PJU normal.'
      },
      {
        id: 'pt-2',
        waktu: '00:15 WIB',
        petugas: 'Bp. Sugih',
        rute: 'Blok B6 -> B7 -> Blok B8 & Lahan Cadangan',
        kondisi: 'Aman Terkendali',
        catatan: 'Pagar pembatas belakang aman, tidak ada orang asing.'
      }
    ];
  });

  // 3. Emergency Alerts State
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('saung_kebun_emergency_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('saung_kebun_guest_logs', JSON.stringify(guestLogs));
  }, [guestLogs]);

  useEffect(() => {
    localStorage.setItem('saung_kebun_patrol_logs', JSON.stringify(patrolLogs));
  }, [patrolLogs]);

  useEffect(() => {
    localStorage.setItem('saung_kebun_emergency_alerts', JSON.stringify(activeAlerts));
  }, [activeAlerts]);

  // Modals & Form states
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({
    namaTamu: '',
    jenisTamu: 'Tamu Keluarga' as GuestLog['jenisTamu'],
    kendaraan: 'Mobil' as GuestLog['kendaraan'],
    platNomor: '',
    blokTujuan: 'B03/01',
    keperluan: ''
  });

  const [isAddPatrolOpen, setIsAddPatrolOpen] = useState(false);
  const [patrolForm, setPatrolForm] = useState({
    rute: 'Keliling Blok B3, B5, B6, B7, B8',
    kondisi: 'Aman Terkendali' as PatrolLog['kondisi'],
    catatan: ''
  });

  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState<'ALL' | 'DI_DALAM' | 'SUDAH_KELUAR'>('ALL');
  const [residentSearch, setResidentSearch] = useState('');

  // Handle Add Guest
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.namaTamu.trim()) return;

    const newGuest: GuestLog = {
      id: `gst-${Date.now()}`,
      namaTamu: guestForm.namaTamu.trim(),
      jenisTamu: guestForm.jenisTamu,
      kendaraan: guestForm.kendaraan,
      platNomor: guestForm.platNomor.trim().toUpperCase() || 'TIDAK_ADA',
      blokTujuan: guestForm.blokTujuan,
      keperluan: guestForm.keperluan.trim() || 'Kunjungan Warga',
      waktuMasuk: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'DI_DALAM',
      petugasJaga: currentGuardName
    };

    setGuestLogs(prev => [newGuest, ...prev]);
    setIsAddGuestOpen(false);
    setGuestForm({
      namaTamu: '',
      jenisTamu: 'Tamu Keluarga',
      kendaraan: 'Mobil',
      platNomor: '',
      blokTujuan: 'B03/01',
      keperluan: ''
    });
  };

  // Handle Checkout Guest
  const handleCheckoutGuest = (id: string) => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setGuestLogs(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          status: 'SUDAH_KELUAR',
          waktuKeluar: timeNow
        };
      }
      return g;
    }));
  };

  // Handle Add Patrol Log
  const handleAddPatrol = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PatrolLog = {
      id: `pt-${Date.now()}`,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      petugas: currentGuardName,
      rute: patrolForm.rute,
      kondisi: patrolForm.kondisi,
      catatan: patrolForm.catatan || 'Kondisi lingkungan terpantau aman terkendali.'
    };

    setPatrolLogs(prev => [newLog, ...prev]);
    setIsAddPatrolOpen(false);
    setPatrolForm({
      rute: 'Keliling Blok B3, B5, B6, B7, B8',
      kondisi: 'Aman Terkendali',
      catatan: ''
    });
  };

  // Trigger Emergency Alarm
  const triggerAlarm = (tipe: EmergencyAlert['tipe'], label: string) => {
    const confirmAlert = window.confirm(`AKTIFKAN SIRINE DARURAT ${label.toUpperCase()}?\n\nNotifikasi siaga akan dikirimkan ke seluruh regu satpam dan pengurus paguyuban.`);
    if (!confirmAlert) return;

    const newAlert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tipe,
      lokasi: 'Perumahan Saung Kebun',
      pelapor: currentGuardName,
      deskripsi: `Alarm darurat ${label} diaktifkan oleh petugas pos jaga. Regu siaga segera meluncur ke lokasi.`,
      status: 'AKTIF'
    };

    setActiveAlerts(prev => [newAlert, ...prev]);
  };

  const resolveAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'SELESAI' } : a));
  };

  // Filtered lists
  const filteredGuests = guestLogs.filter(g => {
    const matchesFilter = guestFilter === 'ALL' || g.status === guestFilter;
    const matchesSearch =
      g.namaTamu.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.platNomor.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.blokTujuan.toLowerCase().includes(guestSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeGuestsCount = guestLogs.filter(g => g.status === 'DI_DALAM').length;

  const filteredResidents = residents.filter(r => {
    return (
      r.blok.toLowerCase().includes(residentSearch.toLowerCase()) ||
      r.nama.toLowerCase().includes(residentSearch.toLowerCase()) ||
      r.noWhatsapp.includes(residentSearch)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner Pos Jaga */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 shadow-2xl border border-amber-900/40">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Pos Jaga & Gerbang Utama Saung Kebun
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200">
                Shift Siaga 24 Jam
              </span>
            </div>

            {onOpenSwitchAccount && (
              <button
                onClick={onOpenSwitchAccount}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Ganti Petugas Jaga
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Portal Keamanan &amp; Buku Tamu Digital
          </h1>
          <p className="text-amber-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Sistem pengawasan gerbang perumahan, pencatatan tamu &amp; kendaraan masuk, log ronda malam, serta tombol darurat lingkungan real-time Saung Kebun.
          </p>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-amber-200/70 block uppercase font-mono">Tamu di Dalam</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
                {activeGuestsCount} <span className="text-xs font-normal text-slate-300">Kendaraan</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-amber-200/70 block uppercase font-mono">Total Tamu Hari Ini</span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                {guestLogs.length} <span className="text-xs font-normal text-slate-300">Kunjungan</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-amber-200/70 block uppercase font-mono">Ronda Selesai</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {patrolLogs.length} <span className="text-xs font-normal text-slate-300">Rute</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-amber-200/70 block uppercase font-mono">Petugas Jaga Aktif</span>
              <div className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                {currentGuardName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner (If Active) */}
      {activeAlerts.some(a => a.status === 'AKTIF') && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl animate-pulse flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-white shrink-0 animate-bounce" />
            <div>
              <div className="text-sm font-extrabold uppercase tracking-wider">
                🚨 PERINGATAN DARURAT AKTIF: {activeAlerts.find(a => a.status === 'AKTIF')?.tipe}
              </div>
              <div className="text-xs text-rose-100">
                {activeAlerts.find(a => a.status === 'AKTIF')?.deskripsi} (Pukul {activeAlerts.find(a => a.status === 'AKTIF')?.waktu})
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const active = activeAlerts.find(a => a.status === 'AKTIF');
              if (active) resolveAlert(active.id);
            }}
            className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-md transition-colors shrink-0 cursor-pointer"
          >
            Matikan Alarm &amp; Selesai
          </button>
        </div>
      )}

      {/* 2. Sub-Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar touch-pan-x">
        <button
          onClick={() => setActiveSubTab('TAMU')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'TAMU'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4 text-amber-600" />
          <span>Buku Tamu ({activeGuestsCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('DARURAT')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'DARURAT'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-slate-600 hover:text-rose-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Panic Button (Darurat)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PATROLI')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'PATROLI'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Ronda &amp; Kontrol Malam</span>
        </button>

        <button
          onClick={() => setActiveSubTab('VERIFIKASI')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'VERIFIKASI'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Interkom Kontak Kavling</span>
        </button>
      </div>

      {/* 3. Sub-Tab Content: BUKU TAMU & KENDARAAN MASUK */}
      {activeSubTab === 'TAMU' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama tamu, plat nomor, blok..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setGuestFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    guestFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({guestLogs.length})
                </button>
                <button
                  onClick={() => setGuestFilter('DI_DALAM')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    guestFilter === 'DI_DALAM' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Di Dalam ({activeGuestsCount})
                </button>
                <button
                  onClick={() => setGuestFilter('SUDAH_KELUAR')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    guestFilter === 'SUDAH_KELUAR' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Keluar
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsAddGuestOpen(true)}
              className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Tamu Baru</span>
            </button>
          </div>

          {/* Table of Guests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Nama Tamu &amp; Kategori</th>
                    <th className="px-4 py-3">Kendaraan / Plat No</th>
                    <th className="px-4 py-3">Tujuan Kavling</th>
                    <th className="px-4 py-3">Keperluan</th>
                    <th className="px-4 py-3">Waktu Masuk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada catatan tamu yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const isInside = guest.status === 'DI_DALAM';
                      const hostResident = residents.find(r => r.blok === guest.blokTujuan);

                      return (
                        <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{guest.namaTamu}</div>
                            <span className="text-[10px] text-slate-500">{guest.jenisTamu}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {guest.platNomor}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{guest.kendaraan}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {guest.blokTujuan}
                              </span>
                              {hostResident && (
                                <span className="text-[11px] text-slate-600 truncate max-w-[120px]">
                                  ({hostResident.nama})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                            {guest.keperluan}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            <div>Masuk: {guest.waktuMasuk}</div>
                            {guest.waktuKeluar && (
                              <div className="text-[10px] text-slate-400">Keluar: {guest.waktuKeluar}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isInside
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isInside ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Di Dalam
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Sudah Keluar
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isInside ? (
                              <button
                                onClick={() => handleCheckoutGuest(guest.id)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>Tandai Keluar</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">Selesai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab Content: PANIC BUTTON (SISTEM DARURAT) */}
      {activeSubTab === 'DARURAT' && (
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Pusat Kendali Alarm &amp; Siaga Darurat Lingkungan</span>
            </h3>
            <p className="text-xs text-rose-700 mt-1">
              Tombol ini digunakan oleh satpam pos jaga saat terjadi insiden mendesak. Sistem akan memancarkan peringatan audio-visual dan mencatat kronologi ke log audit paguyuban.
            </p>
          </div>

          {/* 4 Big Emergency Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => triggerAlarm('KEBAKARAN', 'Kebakaran / Api')}
              className="p-5 bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-3xl shadow-lg shadow-rose-600/30 text-left transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div className="text-base font-extrabold">🚨 KEBAKARAN</div>
              <div className="text-xs text-rose-100 mt-1">
                Panggil regu pemadam, evakuasi warga, dan buka seluruh portal jalan.
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 text-[10px] uppercase font-bold tracking-wider text-rose-200">
                Pencet untuk aktifkan sirine
              </div>
            </button>

            <button
              onClick={() => triggerAlarm('MEDIS', 'Darurat Medis / Ambulans')}
              className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-3xl shadow-lg shadow-blue-600/30 text-left transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Ambulance className="w-7 h-7 text-white" />
              </div>
              <div className="text-base font-extrabold">🚑 DARURAT MEDIS</div>
              <div className="text-xs text-blue-100 mt-1">
                Warga sakit mendadak, panggil ambulans, arahkan ke kavling tujuan.
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 text-[10px] uppercase font-bold tracking-wider text-blue-200">
                Pencet untuk siaga ambulans
              </div>
            </button>

            <button
              onClick={() => triggerAlarm('PENCURIAN', 'Maling / Orang Mencurigakan')}
              className="p-5 bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white rounded-3xl shadow-lg shadow-amber-600/30 text-left transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div className="text-base font-extrabold">⚠️ ORANG MENCURIGAKAN</div>
              <div className="text-xs text-amber-100 mt-1">
                Tutup gerbang keluar, kunci akses perumahan, dan sisir seluruh blok.
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 text-[10px] uppercase font-bold tracking-wider text-amber-200">
                Pencet untuk kunci portal
              </div>
            </button>

            <button
              onClick={() => triggerAlarm('BENCANA', 'Bencana / Pohon Tumbang')}
              className="p-5 bg-gradient-to-br from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-3xl shadow-lg shadow-slate-900/30 text-left transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div className="text-base font-extrabold">🌪️ BENCANA / DARURAT</div>
              <div className="text-xs text-slate-300 mt-1">
                Pohon tumbang menutup jalan, tiang roboh, kabel PLN putus, atau banjir.
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 text-[10px] uppercase font-bold tracking-wider text-slate-300">
                Pencet untuk evakuasi
              </div>
            </button>
          </div>

          {/* Emergency Alert History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Riwayat Penanganan Darurat Pos Keamanan
            </h4>
            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada insiden darurat yang tercatat. Lingkungan dalam keadaan kondusif dan aman.
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{alert.tipe}</span>
                        <span className="text-[10px] font-mono text-slate-500">Pukul {alert.waktu}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          alert.status === 'AKTIF' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{alert.deskripsi}</p>
                      <div className="text-[11px] text-slate-400 mt-1">Petugas: {alert.pelapor}</div>
                    </div>

                    {alert.status === 'AKTIF' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Selesaikan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Sub-Tab Content: RONDA & KONTROL MALAM */}
      {activeSubTab === 'PATROLI' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Checklist Patroli Ronda Malam &amp; Kontrol PJU
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan rute keliling pos jaga untuk menjamin ketertiban dan keamanan 141 kavling warga.
              </p>
            </div>

            <button
              onClick={() => setIsAddPatrolOpen(true)}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Hasil Ronda</span>
            </button>
          </div>

          {/* Rute Checklist Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { pos: 'Titik 1', name: 'Gerbang Utama & Portal', status: 'Aman Terkunci', pju: 'Lampu Nyala' },
              { pos: 'Titik 2', name: 'Blok B03 & Taman Depan', status: 'Aman Terkendali', pju: 'PJU Normal' },
              { pos: 'Titik 3', name: 'Blok B05 & Fasum Jalan', status: 'Aman Terkendali', pju: 'PJU Normal' },
              { pos: 'Titik 4', name: 'Blok B06 & B07 Lapangan', status: 'Aman Terkendali', pju: 'PJU Normal' },
              { pos: 'Titik 5', name: 'Blok B08 & Pagar Belakang', status: 'Aman Terkendali', pju: 'Pagar Rapat' }
            ].map((p, idx) => (
              <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">{p.pos}</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{p.name}</div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Log History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Catatan Log Ronda Petugas
            </h4>
            <div className="space-y-2.5">
              {patrolLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{log.waktu}</span>
                      <span className="font-semibold text-slate-800">· {log.petugas}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.kondisi}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium mt-1">Rute: {log.rute}</div>
                    <p className="text-slate-500 mt-0.5">{log.catatan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Sub-Tab Content: INTERKOM & KONTAK KAVLING */}
      {activeSubTab === 'VERIFIKASI' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Interkom Digital &amp; Direktori 141 Kavling Saung Kebun
                </h3>
                <p className="text-xs text-slate-500">
                  Cari unit warga untuk konfirmasi paket kurir atau verifikasi tamu yang tiba di pos gerbang.
                </p>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari blok (e.g. B07/16, B05/21) atau nama..."
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Resident Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredResidents.map(res => (
              <div key={res.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      {res.blok}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      res.statusHunian === 'Rumah Kosong'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {res.statusHunian}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-xs truncate">{res.nama}</h5>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{res.noWhatsapp}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Tipe: {res.tipeRumah}</span>
                  <a
                    href={`https://wa.me/${res.noWhatsapp.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo Bp/Ibu ${res.nama} (Kavling ${res.blok}), kami dari Pos Satpam Saung Kebun menginformasikan ada tamu/paket di gerbang utama.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Konfirmasi WA</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Tambah Tamu Baru */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Catat Tamu &amp; Kendaraan Masuk</h3>
              </div>
              <button
                onClick={() => setIsAddGuestOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tamu / Pengunjung</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bp. Hendra / Kurir Shopee"
                  value={guestForm.namaTamu}
                  onChange={(e) => setGuestForm({ ...guestForm, namaTamu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Tamu</label>
                  <select
                    value={guestForm.jenisTamu}
                    onChange={(e) => setGuestForm({ ...guestForm, jenisTamu: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Tamu Keluarga">Tamu Keluarga</option>
                    <option value="Kurir / Paket">Kurir / Paket</option>
                    <option value="Ojek / Taksi Online">Ojol / Taksi Online</option>
                    <option value="Tukang / Renovasi">Tukang / Renovasi</option>
                    <option value="Instansi / Lainnya">Instansi / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kendaraan</label>
                  <select
                    value={guestForm.kendaraan}
                    onChange={(e) => setGuestForm({ ...guestForm, kendaraan: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Mobil">Mobil</option>
                    <option value="Motor">Motor</option>
                    <option value="Truk / Pikap">Truk / Pikap</option>
                    <option value="Jalan Kaki">Jalan Kaki</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plat Nomor Polisi</label>
                  <input
                    type="text"
                    placeholder="Contoh: B 1234 SKB"
                    value={guestForm.platNomor}
                    onChange={(e) => setGuestForm({ ...guestForm, platNomor: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kavling Tujuan</label>
                  <select
                    value={guestForm.blokTujuan}
                    onChange={(e) => setGuestForm({ ...guestForm, blokTujuan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {residents.map(r => (
                      <option key={r.id} value={r.blok}>
                        {r.blok} - {r.nama.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keperluan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Kirim paket / Kunjungan silaturahmi"
                  value={guestForm.keperluan}
                  onChange={(e) => setGuestForm({ ...guestForm, keperluan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGuestOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Simpan &amp; Buka Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Log Patroli */}
      {isAddPatrolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-blue-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Catat Hasil Patroli Ronda</h3>
              </div>
              <button
                onClick={() => setIsAddPatrolOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatrol} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rute Keliling</label>
                <input
                  type="text"
                  required
                  value={patrolForm.rute}
                  onChange={(e) => setPatrolForm({ ...patrolForm, rute: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kondisi Situasi</label>
                <select
                  value={patrolForm.kondisi}
                  onChange={(e) => setPatrolForm({ ...patrolForm, kondisi: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Aman Terkendali">Aman Terkendali</option>
                  <option value="PJU / Lampu Padam">PJU / Lampu Padam</option>
                  <option value="Pagar / Pintu Terbuka">Pagar / Pintu Terbuka</option>
                  <option value="Mencurigakan">Ada Hal Mencurigakan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Petugas</label>
                <textarea
                  rows={3}
                  placeholder="Kondisi portal, lampu jalan, kendaraan parkir, dll..."
                  value={patrolForm.catatan}
                  onChange={(e) => setPatrolForm({ ...patrolForm, catatan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatrolOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Simpan Catatan Ronda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
