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
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { PaymentModal } from './components/PaymentModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { WhatsAppLogModal } from './components/WhatsAppLogModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { Resident, Transaction, AuditLog, WhatsAppNotification, FinancialSummary, Role, OrganizationOfficer } from './types';
import { getSummary, getResidents, getTransactions, getAuditLogs, getNotifications } from './lib/api';
import { testFirestoreConnection } from './lib/firebase';
import {
  subscribeToFirestoreResidents,
  subscribeToFirestoreTransactions,
  subscribeToFirestoreAuditLogs,
  seedFirestoreIfEmpty
} from './lib/firestoreService';
import { Building2, Shield, Heart, Database, Radio, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'warga-portal' | 'admin'>('overview');
  
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

  // Admin subview toggle (Bendahara vs Ketua)
  const [adminView, setAdminView] = useState<'BENDAHARA' | 'KETUA'>('BENDAHARA');

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

  const handleSelectUser = (user: any) => {
    setCurrentUser(user);
    if (user.role === 'WARGA') {
      setActiveTab('warga-portal');
    } else if (user.role === 'BENDAHARA') {
      setAdminView('BENDAHARA');
      setActiveTab('admin');
    } else if (user.role === 'KETUA') {
      setAdminView('KETUA');
      setActiveTab('admin');
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
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
        />

        {/* Realtime Database Status Banner */}
        <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-800/80 px-3.5 sm:px-6 py-1.5 text-xs">
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
                className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-800/80 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - with pb-24 for mobile/tablet dock clearance */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
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
                    setAdminView('BENDAHARA');
                    setActiveTab('admin');
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
                />
              )}

              {activeTab === 'admin' && (
                <div className="space-y-4">
                  {/* Admin Subview Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-white rounded-2xl border border-slate-200/90 gap-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        onClick={() => setAdminView('BENDAHARA')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
                          adminView === 'BENDAHARA'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Panel Bendahara (Kasir &amp; Tagihan)
                      </button>
                      <button
                        onClick={() => setAdminView('KETUA')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
                          adminView === 'KETUA'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Panel Eksekutif Ketua
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-2 text-xs text-slate-500 font-medium">
                      <span>Peran Aktif:</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {currentUser.role} ({currentUser.name})
                      </span>
                    </div>
                  </div>

                  {/* Render Subview */}
                  {adminView === 'BENDAHARA' ? (
                    <BendaharaAdmin
                      residents={residents}
                      transactions={transactions}
                      onOpenPayForResident={handleOpenPayForResident}
                      onRefreshData={loadAllData}
                    />
                  ) : (
                    <KetuaAdmin
                      summary={summary}
                      residents={residents}
                      transactions={transactions}
                      auditLogs={auditLogs}
                      onRefreshData={loadAllData}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={currentUser.role}
        unpaidCount={summary?.totalWargaBelumBayar || 0}
        onOpenPayModal={() => {
          setPayTargetResident(activeResident);
          setIsPayModalOpen(true);
        }}
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
    </div>
  );
}
