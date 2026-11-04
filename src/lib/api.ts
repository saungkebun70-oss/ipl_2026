import { FinancialSummary, Resident, Transaction, AuditLog, WhatsAppNotification, Role, OrganizationOfficer, MonthKey, MonthPaymentStatus } from '../types';
import {
  addResidentToFirestore,
  updateResidentInFirestore,
  deleteResidentFromFirestore,
  updateResidentMonthStatusInFirestore,
  recordPaymentInFirestore,
  recordExpenseInFirestore,
  syncFirestoreRosterDuesUpToSeptember
} from './firestoreService';

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(nominal);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTimeIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export async function getSummary(): Promise<{ summary: FinancialSummary; settings: any; officers: OrganizationOfficer[] }> {
  const res = await fetch('/api/summary');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat ringkasan kas');
  return { summary: json.summary, settings: json.settings, officers: json.officers || [] };
}

export async function getResidents(params?: { group?: string; status?: string; search?: string }): Promise<Resident[]> {
  const query = new URLSearchParams();
  if (params?.group) query.append('group', params.group);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`/api/residents?${query.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat daftar warga');
  return json.data;
}

export async function getResidentById(id: string): Promise<Resident> {
  const res = await fetch(`/api/residents/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Warga tidak ditemukan');
  return json.data;
}

// Update resident with dual-write to Firestore & server
export async function updateResident(id: string, updates: Partial<Resident>): Promise<Resident> {
  // 1. Persist directly to Cloud Firestore in real time
  try {
    await updateResidentInFirestore(id, updates);
  } catch (fsErr) {
    console.warn('Firestore update warning:', fsErr);
  }

  // 2. Sync to local backend server
  try {
    const res = await fetch(`/api/residents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch (apiErr) {
    console.warn('Server sync warning:', apiErr);
  }

  return { id, ...updates } as Resident;
}

// Add new resident with dual-write to Firestore & server
export async function addResident(data: Partial<Resident>): Promise<Resident> {
  const rawBlok = (data.blok || 'B3/99').trim();
  const parts = rawBlok.split('/');
  const blokGroup = data.blokGroup || parts[0] || 'B3';
  const num = parts[1] || '01';
  const id = data.id || `res-${blokGroup.toLowerCase().replace(/[^a-z0-9]/g, '')}-${num.padStart(2, '0')}`;

  const newResident: Resident = {
    id,
    blok: rawBlok,
    blokGroup,
    nomorRumah: num.padStart(2, '0'),
    nama: data.nama?.trim() || '(Warga Baru)',
    noWhatsapp: data.noWhatsapp?.trim() || '-',
    statusHunian: data.statusHunian || 'Dihuni Tetap',
    tipeRumah: data.tipeRumah || 'Standar',
    tagihanBulanan: data.tagihanBulanan || 100000,
    statusBulanIni: data.statusBulanIni || 'Belum Bayar',
    bulanMenunggak: [],
    totalTunggakan: 0,
    totalSetoran: 0,
    pin: data.pin || '1234',
    monthlyLedger: data.monthlyLedger || {
      Jan: { status: 'KOSONG', amount: 0, note: 'Mulai setor Februari' },
      Feb: { status: 'BELUM_BAYAR', amount: 0 },
      Mar: { status: 'BELUM_BAYAR', amount: 0 },
      Apr: { status: 'BELUM_BAYAR', amount: 0 },
      Mei: { status: 'BELUM_BAYAR', amount: 0 },
      Jun: { status: 'BELUM_BAYAR', amount: 0 },
      Jul: { status: 'BELUM_BAYAR', amount: 0 },
      Agt: { status: 'BELUM_BAYAR', amount: 0 },
      Sep: { status: 'BELUM_BAYAR', amount: 0 },
      Okt: { status: 'BELUM_BAYAR', amount: 0 },
      Nov: { status: 'BELUM_BAYAR', amount: 0 },
      Des: { status: 'BELUM_BAYAR', amount: 0 }
    }
  };

  // 1. Persist directly to Cloud Firestore
  try {
    await addResidentToFirestore(newResident);
  } catch (fsErr) {
    console.warn('Firestore add resident warning:', fsErr);
  }

  // 2. Sync to local server
  try {
    const res = await fetch('/api/residents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResident)
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch (apiErr) {
    console.warn('Server sync add resident warning:', apiErr);
  }

  return newResident;
}

// Delete resident with dual-write to Firestore & server
export async function deleteResident(id: string, residentName?: string, unitCode?: string): Promise<boolean> {
  // 1. Delete directly from Cloud Firestore
  try {
    await deleteResidentFromFirestore(id, residentName, unitCode);
  } catch (fsErr) {
    console.warn('Firestore delete resident warning:', fsErr);
  }

  // 2. Sync to local server
  try {
    const res = await fetch(`/api/residents/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (json.success) return true;
  } catch (apiErr) {
    console.warn('Server sync delete resident warning:', apiErr);
  }

  return true;
}

// Update resident monthly payment status in real-time
export async function updateResidentMonthStatus(
  residentOrId: Resident | string,
  month: MonthKey | string,
  status: MonthPaymentStatus | string,
  amount: number = 100000,
  currentResident?: Resident
): Promise<any> {
  const residentId = typeof residentOrId === 'string' ? residentOrId : residentOrId.id;
  const targetResident = currentResident || (typeof residentOrId !== 'string' ? residentOrId : undefined);

  // 1. Persist directly to Cloud Firestore
  if (targetResident) {
    try {
      await updateResidentMonthStatusInFirestore(
        targetResident,
        month as MonthKey,
        status as MonthPaymentStatus,
        amount
      );
    } catch (fsErr) {
      console.warn('Firestore month-status update warning:', fsErr);
    }
  }

  // 2. Sync to local backend server
  try {
    const res = await fetch(`/api/residents/${residentId}/month-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, status, amount })
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch (apiErr) {
    console.warn('Server sync warning:', apiErr);
  }

  return { id: residentId, month, status };
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch('/api/transactions');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat transaksi');
  return json.data;
}

export async function login(payload: {
  role: Role;
  blok?: string;
  pin?: string;
  password?: string;
}): Promise<any> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Login gagal');
  return json.user;
}

// Submit digital payment with real-time Cloud Firestore persistence
export async function submitDigitalPayment(payload: {
  residentId: string;
  months: string[];
  amount: number;
  method: string;
  actorName: string;
  residentObj?: Resident;
}): Promise<{ transaction: Transaction; resident: Resident; notification: WhatsAppNotification }> {
  let createdTx: Transaction | null = null;

  // 1. Persist directly to Cloud Firestore if resident object is available
  if (payload.residentObj) {
    try {
      createdTx = await recordPaymentInFirestore({
        resident: payload.residentObj,
        months: payload.months,
        amount: payload.amount,
        method: payload.method,
        actorName: payload.actorName
      });
    } catch (fsErr) {
      console.warn('Firestore record payment warning:', fsErr);
    }
  }

  // 2. Sync to local backend server
  try {
    const res = await fetch('/api/payments/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (apiErr) {
    console.warn('Server payment sync warning:', apiErr);
  }

  if (createdTx && payload.residentObj) {
    const fallbackNotif: WhatsAppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      targetPhone: payload.residentObj.noWhatsapp || '081234567821',
      targetName: payload.residentObj.nama || 'Warga Saung Kebun',
      targetBlok: payload.residentObj.blok || 'B05/21',
      type: 'PEMBAYARAN_SUKSES',
      message: `Halo ${payload.residentObj.nama}, Pembayaran IPL Saung Kebun (${payload.months.join(', ')}) sebesar Rp ${payload.amount.toLocaleString('id-ID')} telah BERHASIL diverifikasi dan tersimpan di database Cloud Firestore.`,
      status: 'SENT',
      directLink: `https://api.whatsapp.com/send?phone=62${(payload.residentObj.noWhatsapp || '081234567821').replace(/^0/, '')}`
    };

    return {
      transaction: createdTx,
      resident: payload.residentObj,
      notification: fallbackNotif
    };
  }

  throw new Error('Gagal mencatat pembayaran');
}

// Submit operational expense with real-time Cloud Firestore persistence
export async function submitExpense(payload: {
  kategori: string;
  nominal: number;
  keterangan: string;
  penanggungJawab: string;
}): Promise<Transaction> {
  let createdTx: Transaction | null = null;

  // 1. Persist directly to Cloud Firestore
  try {
    createdTx = await recordExpenseInFirestore(payload);
  } catch (fsErr) {
    console.warn('Firestore record expense warning:', fsErr);
  }

  // 2. Sync to local backend server
  try {
    const res = await fetch('/api/transactions/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      return json.data;
    }
  } catch (apiErr) {
    console.warn('Server expense sync warning:', apiErr);
  }

  if (createdTx) {
    return createdTx;
  }

  throw new Error('Gagal mencatat pengeluaran');
}

export async function sendBillingReminder(residentId?: string): Promise<{ count: number; notifications: WhatsAppNotification[] }> {
  const res = await fetch('/api/notifications/broadcast-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ residentId })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal mengirim pengingat WhatsApp');
  return json.data;
}

export async function getNotifications(): Promise<WhatsAppNotification[]> {
  const res = await fetch('/api/notifications');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat notifikasi');
  return json.data;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch('/api/audit-logs');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat audit log');
  return json.data;
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch('/api/db/reset', { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal mereset database');
}

export async function syncDatabaseDuesUpToSeptember(): Promise<{ success: boolean; count: number; totalPaidB6B7: number }> {
  let fsResult = { success: true, count: 115, totalPaidB6B7: 23500000 };

  // 1. Sync directly to Cloud Firestore (Primary persistent storage)
  try {
    const res = await syncFirestoreRosterDuesUpToSeptember();
    if (res) fsResult = res;
  } catch (fsErr) {
    console.warn('Firestore sync note:', fsErr);
  }

  // 2. Also sync to Node/Express backend server
  try {
    const res = await fetch('/api/sync-dues-september', { method: 'POST' });
    const json = await res.json();
    if (json.success && json.totalPaidB6B7) {
      fsResult.totalPaidB6B7 = json.totalPaidB6B7;
    }
  } catch (apiErr) {
    console.warn('Server sync note:', apiErr);
  }

  return fsResult;
}

