/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileHeader } from './components/MobileHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { DatabaseWarga } from './components/DatabaseWarga';
import { ResidentDirectory } from './components/ResidentDirectory';
import { WargaPortal } from './components/WargaPortal';
import { BendaharaAdmin } from './components/BendaharaAdmin';
import { KetuaAdmin } from './components/KetuaAdmin';
import { KeamananPortal } from './components/KeamananPortal';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { PaymentModal } from './components/PaymentModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { WhatsAppLogModal } from './components/WhatsAppLogModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { ShareAppModal } from './components/ShareAppModal';
import { ResidentAccountManagerModal } from './components/ResidentAccountManagerModal';
import { LoginGateModal } from './components/LoginGateModal';
import { Resident, Transaction, AuditLog, WhatsAppNotification, FinancialSummary, Role, OrganizationOfficer, AppTab } from './types';
import { getSummary, getResidents, getTransactions, getAuditLogs, getNotifications, syncDatabaseDuesUpToSeptember } from './lib/api';
import { testFirestoreConnection } from './lib/firebase';
import {
  subscribeToFirestoreResidents,
  subscribeToFirestoreTransactions,
  subscribeToFirestoreAuditLogs,
  seedFirestoreIfEmpty
} from './lib/firestoreService';
import { Building2, Shield, Heart, Database, Radio, CheckCircle2, RefreshCw, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  
  // Current active user session (default to resident in Blok B5/21)
  const [currentUser, setCurrentUser] = useState<{
    role: Role;
    name: string;
    title: string;
    blok?: string;
    residentId?: string;
    phone?: string;
    resident?: Resident;
  }>({
    role: 'WARGA',
    residentId: 'res-b5-21',
    name: 'HARTONO (BP DONI - HUMAS)',
    title: 'Warga Blok B05/21',
    blok: 'B05/21',
    phone: '081234567821'
  });

  // Data states
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [officers, setOfficers] = useState<OrganizationOfficer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore Real-time telemetry
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Memulai koneksi...');
  const [showLiveStatusDetails, setShowLiveStatusDetails] = useState(false);

  // Modals
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payTargetResident, setPayTargetResident] = useState<Resident | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isWhatsAppLogsOpen, setIsWhatsAppLogsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isShareAppOpen, setIsShareAppOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isLoginGateOpen, setIsLoginGateOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      const [sumRes, resRes, txRes, logsRes, notifRes] = await Promise.all([
        getSummary(),
        getResidents(),
        getTransactions(),
        getAuditLogs(),
        getNotifications()
      ]);

      setSummary(sumRes.summary);
      setResidents(resRes);
      setOfficers(sumRes.officers || []);
      setTransactions(txRes);
      setAuditLogs(logsRes);
      setNotifications(notifRes);

      // Keep current resident object updated
      if (currentUser.role === 'WARGA' && currentUser.residentId) {
        const updatedRes = resRes.find(r => r.id === currentUser.residentId);
        if (updatedRes) {
          setCurrentUser(prev => ({
            ...prev,
            name: updatedRes.nama,
            blok: updatedRes.blok,
            resident: updatedRes
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and real-time Cloud Firestore listeners
  useEffect(() => {
    let isMounted = true;

    // 1. Initial fast baseline from server
    loadAllData();

    // 2. Ensure connection and seed Firestore if empty
    testFirestoreConnection();
    seedFirestoreIfEmpty().then((seeded) => {
      if (seeded && isMounted) {
        console.log('115 Data Warga Saung Kebun berhasil diinisialisasi ke Cloud Firestore');
      }
    }).catch(console.error);

    // Auto-sync dues up to September once to ensure persistent Firestore has latest ledger
    const hasSyncedSept = localStorage.getItem('saung_kebun_dues_synced_sept_2026_v2');
    if (!hasSyncedSept) {
      syncDatabaseDuesUpToSeptember().then(() => {
        localStorage.setItem('saung_kebun_dues_synced_sept_2026_v2', 'true');
        console.log('Database iuran sampai September berhasil disinkronkan otomatis.');
      }).catch(console.error);
    }

    // 3. Real-time Firestore snapshot listeners
    const unsubResidents = subscribeToFirestoreResidents(
      (liveResidents) => {
        if (!isMounted) return;
        if (liveResidents && liveResidents.length > 0) {
          setResidents(liveResidents);
          setIsFirestoreLive(true);
          setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setIsLoading(false);

          // Update current user resident reference if active
          setCurrentUser((prev) => {
            if (prev.role === 'WARGA' && prev.residentId) {
              const matched = liveResidents.find((r) => r.id === prev.residentId);
              if (matched) {
                return {
                  ...prev,
                  name: matched.nama,
                  blok: matched.blok,
                  resident: matched
                };
              }
            }
            return prev;
          });
        }
      },
      (err) => {
        console.warn('Firestore live residents stream error:', err);
      }
    );

    const unsubTransactions = subscribeToFirestoreTransactions(
      (liveTxs) => {
        if (!isMounted) return;
        if (liveTxs && liveTxs.length > 0) {
          setTransactions(liveTxs);
        }
      },
      (err) => {
        console.warn('Firestore live transactions stream error:', err);
      }
    );

    const unsubAuditLogs = subscribeToFirestoreAuditLogs(
      (liveLogs) => {
        if (!isMounted) return;
        if (liveLogs && liveLogs.length > 0) {
          setAuditLogs(liveLogs);
        }
      },
      (err) => {
        console.warn('Firestore live audit logs stream error:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubResidents();
      unsubTransactions();
      unsubAuditLogs();
    };
  }, []);

  // Dynamically calculate KPIs whenever residents or transactions change in real time
  useEffect(() => {
    if (residents.length > 0) {
      const totalWarga = residents.length;
      const totalWargaLunas = residents.filter(r => r.statusBulanIni === 'Lunas').length;
      const totalWargaBelumBayar = totalWarga - totalWargaLunas;
      const persentaseKepatuhan = Math.round((totalWargaLunas / totalWarga) * 100);

      let saldoKas = 18500000;
      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      transactions.forEach(t => {
        if (t.status === 'BERHASIL') {
          if (t.tipe === 'PEMASUKAN') {
            totalPemasukan += t.nominal;
            saldoKas += t.nominal;
          } else if (t.tipe === 'PENGELUARAN') {
            totalPengeluaran += t.nominal;
            saldoKas -= t.nominal;
          }
        }
      });

      const totalTunggakanWarga = residents.reduce((acc, r) => acc + (r.totalTunggakan || 0), 0);

      setSummary(prev => ({
        saldoKasSaatIni: saldoKas,
        totalPemasukanBulanIni: totalPemasukan,
        totalPengeluaranBulanIni: totalPengeluaran,
        totalWarga,
        totalWargaLunas,
        totalWargaBelumBayar,
        persentaseKepatuhan,
        targetKasBulanIni: totalWarga * 100000,
        totalTunggakanWarga
      }));
    }
  }, [residents, transactions]);

  // URL Parameter Auto-Login & Session Initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const paramBlok = urlParams.get('blok') || urlParams.get('unit');
    const paramPin = urlParams.get('pin');
    const paramRole = urlParams.get('role');

    // 1. Direct URL Auto-Login for Resident (e.g. ?blok=B03/01&pin=1234)
    if (paramBlok && residents.length > 0) {
      const cleanBlok = paramBlok.trim().toUpperCase();
      const matched = residents.find(r =>
        r.blok.toUpperCase() === cleanBlok ||
        r.id.toLowerCase() === cleanBlok.toLowerCase() ||
        r.blok.replace(/[^A-Z0-9]/g, '') === cleanBlok.replace(/[^A-Z0-9]/g, '')
      );

      if (matched) {
        const expectedPin = matched.pin || '1234';
        if (!paramPin || paramPin === expectedPin || paramPin === '1234') {
          const session = {
            role: 'WARGA' as Role,
            residentId: matched.id,
            name: matched.nama,
            blok: matched.blok,
            title: `Warga Blok ${matched.blok}`,
            phone: matched.noWhatsapp,
            resident: matched
          };
          setCurrentUser(session);
          setActiveTab('warga-portal');
          localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(session));
          setWelcomeToast(`Selamat Datang, ${matched.nama}! Anda telah masuk otomatis ke Portal Warga Blok ${matched.blok}.`);
          setTimeout(() => setWelcomeToast(null), 5000);

          // Clean URL without page refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }
    }

    // 2. Direct URL Auto-Login for Officers (?role=bendahara&pin=8888)
    if (paramRole) {
      const cleanRole = paramRole.toUpperCase();
      if (cleanRole === 'BENDAHARA' && (!paramPin || paramPin === '8888' || paramPin === '1234')) {
        const session = {
          role: 'BENDAHARA' as Role,
          name: 'Bp. Andriansyah',
          title: 'Bendahara Keuangan IPL Saung Kebun',
          blok: 'B07/16',
          phone: '081287654321'
        };
        setCurrentUser(session);
        setActiveTab('bendahara');
        localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(session));
        setWelcomeToast('Selamat Datang Bp. Andriansyah (Bendahara Kas Paguyuban Saung Kebun)!');
        setTimeout(() => setWelcomeToast(null), 5000);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (cleanRole === 'KETUA' && (!paramPin || paramPin === '9999' || paramPin === '1234')) {
        const session = {
          role: 'KETUA' as Role,
          name: 'Bp. Erlangga',
          title: 'Ketua Paguyuban Saung Kebun',
          blok: 'B03/07',
          phone: '081298765432'
        };
        setCurrentUser(session);
        setActiveTab('ketua');
        localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(session));
        setWelcomeToast('Selamat Datang Bp. Erlangga (Ketua Paguyuban Saung Kebun)!');
        setTimeout(() => setWelcomeToast(null), 5000);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (cleanRole === 'KEAMANAN' && (!paramPin || paramPin === '5555' || paramPin === '1234')) {
        const session = {
          role: 'KEAMANAN' as Role,
          name: 'Bp. Mulyono',
          title: 'Komandan Regu Satpam & Pos Keamanan',
          blok: 'POS-01',
          phone: '081399887766'
        };
        setCurrentUser(session);
        setActiveTab('keamanan');
        localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(session));
        setWelcomeToast('Selamat Datang Petugas Keamanan Saung Kebun!');
        setTimeout(() => setWelcomeToast(null), 5000);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (cleanRole === 'WARGA' || urlParams.get('portal') === 'warga') {
        const defaultWarga = residents.find(r => r.blok === 'B05/21') || residents[0];
        if (defaultWarga) {
          const session = {
            role: 'WARGA' as Role,
            residentId: defaultWarga.id,
            name: defaultWarga.nama,
            blok: defaultWarga.blok,
            title: `Warga Blok ${defaultWarga.blok}`,
            phone: defaultWarga.noWhatsapp,
            resident: defaultWarga
          };
          setCurrentUser(session);
          setActiveTab('warga-portal');
          localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(session));
          setWelcomeToast(`Selamat Datang di Portal Warga Saung Kebun!`);
          setTimeout(() => setWelcomeToast(null), 5000);
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }
    }

    // 3. Stored session in localStorage
    const savedSession = localStorage.getItem('sipl_saung_kebun_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.role) {
          if (parsed.role === 'WARGA' && parsed.residentId && residents.length > 0) {
            const currentRes = residents.find(r => r.id === parsed.residentId);
            if (currentRes) {
              parsed.resident = currentRes;
              parsed.name = currentRes.nama;
              parsed.blok = currentRes.blok;
            }
          }
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.warn('Failed parsing saved user session:', e);
      }
    }
  }, [residents]);

  const handleSelectUser = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('sipl_saung_kebun_session', JSON.stringify(user));
    if (user.role === 'WARGA') {
      setActiveTab('warga-portal');
    } else if (user.role === 'BENDAHARA') {
      setActiveTab('bendahara');
    } else if (user.role === 'KETUA') {
      setActiveTab('ketua');
    } else if (user.role === 'KEAMANAN') {
      setActiveTab('keamanan');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sipl_saung_kebun_session');
    setIsLoginGateOpen(true);
  };

  const handleOpenPayForResident = (resident: Resident) => {
    setPayTargetResident(resident);
    setIsPayModalOpen(true);
  };

  const handleOpenReceipt = (tx: Transaction) => {
    setSelectedTxForReceipt(tx);
    setIsReceiptOpen(true);
  };

  const handlePaymentSuccess = () => {
    loadAllData();
  };

  const activeResident = residents.find(r => r.id === currentUser.residentId) || null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop Aesthetic Sidebar (Sticky on Left) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        totalWarga={residents.length}
        totalUnpaid={summary?.totalWargaBelumBayar || 0}
        waNotifCount={notifications.length}
        onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
        onOpenPayModal={() => {
          setPayTargetResident(activeResident);
          setIsPayModalOpen(true);
        }}
        onOpenWhatsAppLogs={() => setIsWhatsAppLogsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenVercelDeploy={() => setIsVercelModalOpen(true)}
        onOpenShareApp={() => setIsShareAppOpen(true)}
        onOpenAccountManager={() => setIsAccountManagerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile & Tablet Header */}
        <MobileHeader
          currentUser={currentUser}
          waNotifCount={notifications.length}
          onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
          onOpenWhatsAppLogs={() => setIsWhatsAppLogsOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
          onOpenVercelDeploy={() => setIsVercelModalOpen(true)}
          onOpenShareApp={() => setIsShareAppOpen(true)}
          onLogout={handleLogout}
        />

        {/* Welcome Toast Notification if auto-logged in */}
        {welcomeToast && (
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-4 py-2.5 text-xs font-bold shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
              <span>{welcomeToast}</span>
            </div>
            <button
              onClick={() => setWelcomeToast(null)}
              className="text-emerald-200 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Realtime Database Status Banner (Clean desktop / tablet view) */}
        <div className="hidden sm:block bg-emerald-950 text-emerald-100 border-b border-emerald-800/80 px-3.5 sm:px-6 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-semibold text-emerald-200 truncate">
                ⚡ Realtime Database Aktif:
              </span>
              <span className="text-emerald-300/90 hidden sm:inline truncate">
                Tersambung ke Google Cloud Firestore (asia-southeast1)
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
              <span className="text-emerald-400 font-mono bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/60 hidden md:inline">
                {residents.length} Warga Terdaftar
              </span>
              <span className="text-emerald-300 text-[10px]">
                Sync: <span className="font-mono text-emerald-200">{lastSyncTime}</span>
              </span>
              <button
                onClick={() => loadAllData()}
                title="Refresh sinkronisasi realtime"
                className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-800/80 rounded transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - with pb-28 for clean mobile bottom dock clearance without overlap */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-28 lg:pb-8">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-700">Memuat Buku Kas Saung Kebun...</p>
              <p className="text-xs text-slate-400 mt-1">Menghubungkan ke database Cloud Firestore real-time</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <DashboardOverview
                  summary={summary}
                  transactions={transactions}
                  residents={residents}
                  officers={officers}
                  onOpenReceipt={handleOpenReceipt}
                  onOpenPayModal={() => {
                    setPayTargetResident(activeResident);
                    setIsPayModalOpen(true);
                  }}
                  onOpenAddExpense={() => {
                    setActiveTab('bendahara');
                  }}
                  isBendaharaOrKetua={currentUser.role === 'BENDAHARA' || currentUser.role === 'KETUA'}
                />
              )}

              {activeTab === 'residents' && (
                <DatabaseWarga
                  residents={residents}
                  onSelectResident={(res) => {
                    setCurrentUser({
                      role: 'WARGA',
                      residentId: res.id,
                      name: res.nama,
                      blok: res.blok,
                      title: `Warga Blok ${res.blok}`,
                      phone: res.noWhatsapp,
                      resident: res
                    });
                    setActiveTab('warga-portal');
                  }}
                  onPayForResident={handleOpenPayForResident}
                  onResidentUpdated={loadAllData}
                />
              )}

              {activeTab === 'warga-portal' && (
                <WargaPortal
                  currentResident={activeResident || residents.find(r => r.blok === 'B05/21') || residents[0]}
                  residents={residents}
                  transactions={transactions}
                  onSelectResident={(res) => {
                    setCurrentUser({
                      role: 'WARGA',
                      residentId: res.id,
                      name: res.nama,
                      blok: res.blok,
                      title: `Warga Blok ${res.blok}`,
                      phone: res.noWhatsapp,
                      resident: res
                    });
                  }}
                  onOpenPayModal={handleOpenPayForResident}
                  onOpenReceipt={handleOpenReceipt}
                  onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
                  onResidentUpdated={loadAllData}
                />
              )}

              {/* Dedicated Panel Bendahara Kas (Terpisah) */}
              {activeTab === 'bendahara' && (
                <BendaharaAdmin
                  residents={residents}
                  transactions={transactions}
                  onOpenPayForResident={handleOpenPayForResident}
                  onRefreshData={loadAllData}
                  onOpenAccountManager={() => setIsAccountManagerOpen(true)}
                  onOpenShareApp={() => setIsShareAppOpen(true)}
                />
              )}

              {/* Dedicated Panel Ketua Paguyuban (Terpisah) */}
              {activeTab === 'ketua' && (
                <KetuaAdmin
                  summary={summary}
                  residents={residents}
                  transactions={transactions}
                  auditLogs={auditLogs}
                  onRefreshData={loadAllData}
                  onOpenVercelDeploy={() => setIsVercelModalOpen(true)}
                />
              )}

              {/* Dedicated Panel Keamanan & Pos Jaga (Terpisah) */}
              {activeTab === 'keamanan' && (
                <KeamananPortal
                  residents={residents}
                  currentGuardName={currentUser.name}
                  onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Dock (Role-Tailored) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={currentUser.role}
        unpaidCount={summary?.totalWargaBelumBayar || 0}
        onOpenPayModal={() => {
          setPayTargetResident(activeResident);
          setIsPayModalOpen(true);
        }}
        onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
        onOpenWhatsAppLogs={() => setIsWhatsAppLogsOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        currentBlok={currentUser.blok}
      />

      {/* Account Switcher Modal (Demo Mode) */}
      <AccountSwitcherModal
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
        residents={residents}
        currentRole={currentUser.role}
        currentResidentId={currentUser.residentId}
        onSelectUser={handleSelectUser}
      />

      {/* Digital Payment Modal (QRIS & VA) */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setPayTargetResident(null);
        }}
        resident={payTargetResident || activeResident}
        residents={residents}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Digital Receipt / Kwitansi Modal */}
      <DigitalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedTxForReceipt(null);
        }}
        transaction={selectedTxForReceipt}
      />

      {/* WhatsApp Logs Modal */}
      <WhatsAppLogModal
        isOpen={isWhatsAppLogsOpen}
        onClose={() => setIsWhatsAppLogsOpen(false)}
        notifications={notifications}
      />

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
      />

      {/* Technical Architecture & Webhook Documentation Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        residents={residents}
        onTriggerWebhookSuccess={loadAllData}
      />

      {/* Vercel Automated Deployment Walkthrough & Status Modal */}
      <VercelDeployModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      {/* Public Share & Auto-Publish Modal */}
      <ShareAppModal
        isOpen={isShareAppOpen}
        onClose={() => setIsShareAppOpen(false)}
        residents={residents}
      />

      {/* Resident Account & Credential Distribution Manager Modal */}
      <ResidentAccountManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
        residents={residents}
        currentRole={currentUser.role}
        adminName={currentUser.name}
        onResidentUpdated={loadAllData}
      />

      {/* Dedicated Login Gate Modal */}
      <LoginGateModal
        isOpen={isLoginGateOpen}
        onClose={() => setIsLoginGateOpen(false)}
        canDismiss={true}
        residents={residents}
        onLoginSuccess={(u) => {
          handleSelectUser(u);
          setIsLoginGateOpen(false);
        }}
        onEnterGuestMode={() => {
          setIsLoginGateOpen(false);
          setActiveTab('overview');
        }}
      />
    </div>
  );
}
