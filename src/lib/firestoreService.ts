import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Resident, Transaction, AuditLog, MonthKey, MonthPaymentStatus, MonthlyLedgerItem, Role } from '../types/index';
import { buildResidentsFromRoster, IPL_TARIFF, MONTH_KEYS, MONTH_LABELS } from '../data/saungKebunRosterData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively strips undefined fields from objects/arrays so Firestore doesn't reject them.
 */
export function cleanFirestoreData<T>(data: T): T {
  if (data === undefined) return null as unknown as T;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) {
    return data.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      result[key] = cleanFirestoreData(val);
    }
  }
  return result as T;
}

// Helper to sort residents logically by block then unit number
export function sortResidentsByUnit(list: Resident[]): Resident[] {
  const blockOrder: Record<string, number> = {
    'B3': 1,
    'B5': 2,
    'B6': 3,
    'B7': 4,
    'B8': 5,
    'B8-Ext': 6
  };

  return [...list].sort((a, b) => {
    const orderA = blockOrder[a.blokGroup] || 99;
    const orderB = blockOrder[b.blokGroup] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return parseInt(a.nomorRumah, 10) - parseInt(b.nomorRumah, 10);
  });
}

// Initial seeder and version updater for Firestore database
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  const path = 'residents';
  try {
    const settingsRef = doc(db, 'settings', 'general');
    const [sampleSnap, settingsSnap] = await Promise.all([
      getDocs(query(collection(db, path), limit(1))),
      getDoc(settingsRef)
    ]);

    const isCurrentVersion = settingsSnap.exists() && settingsSnap.data()?.rosterVersion === '2026.09.v4';

    if (!sampleSnap.empty && isCurrentVersion) {
      return false; // already populated and up to date
    }

    console.log('Syncing / updating 141 Saung Kebun residents up to September 2026 in Cloud Firestore...');
    const initialResidents = buildResidentsFromRoster();

    // Firestore batch limit is 500 operations, 141 fits in a single batch
    const batch = writeBatch(db);
    initialResidents.forEach((res) => {
      const ref = doc(db, 'residents', res.id);
      batch.set(ref, cleanFirestoreData(res), { merge: true });
    });

    // Seed / update settings with version tag
    batch.set(settingsRef, {
      estateName: 'Perumahan Saung Kebun',
      associationName: 'Paguyuban Warga Saung Kebun',
      standardTariff: IPL_TARIFF,
      currentMonth: 'September 2026',
      totalLots: initialResidents.length,
      rosterVersion: '2026.09.v4',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Seed initial audit log if first time
    if (!settingsSnap.exists()) {
      const logRef = doc(db, 'auditLogs', 'log-init-001');
      batch.set(logRef, {
        id: 'log-init-001',
        timestamp: new Date().toISOString(),
        actor: 'Sistem Cloud Firestore',
        role: 'BENDAHARA',
        action: 'DATABASE_INITIALIZATION',
        detail: 'Inisialisasi data warga Saung Kebun ke database real-time.'
      });

      // Seed initial cash balance
      const initTrxRef = doc(db, 'transactions', 'trx-init-001');
      batch.set(initTrxRef, {
        id: 'trx-init-001',
        nomorTransaksi: 'TRX-SK-202610-001',
        tanggal: '2026-10-01T07:00:00.000Z',
        tipe: 'PEMASUKAN',
        kategori: 'Saldo Awal Kas Paguyuban',
        nominal: 18500000,
        keterangan: 'Sisa saldo kas umum perumahan Saung Kebun periode September 2026',
        penanggungJawab: 'Bendahara (Bp. Andriansyah)',
        status: 'BERHASIL'
      });
    }

    await batch.commit();
    console.log('Cloud Firestore successfully synchronized with September 2026 ledger!');
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Real-time listener for residents
export function subscribeToFirestoreResidents(
  onUpdate: (residents: Resident[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'residents';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger background seed if empty
        seedFirestoreIfEmpty().catch(console.error);
        return;
      }
      const list: Resident[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Resident);
      });
      onUpdate(sortResidentsByUnit(list));
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Real-time listener for transactions
export function subscribeToFirestoreTransactions(
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'transactions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Transaction);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Real-time listener for audit logs
export function subscribeToFirestoreAuditLogs(
  onUpdate: (logs: AuditLog[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'auditLogs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: AuditLog[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as AuditLog);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Add new resident to Firestore
export async function addResidentToFirestore(resident: Resident): Promise<void> {
  const path = `residents/${resident.id}`;
  try {
    const ref = doc(db, 'residents', resident.id);
    await setDoc(ref, cleanFirestoreData(resident));

    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara / Pengurus',
      role: 'BENDAHARA',
      action: 'TAMBAH_WARGA',
      detail: `Menambahkan warga baru unit ${resident.blok} (${resident.nama}) ke database.`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Delete resident from Firestore
export async function deleteResidentFromFirestore(residentId: string, residentName?: string, unitCode?: string): Promise<void> {
  const path = `residents/${residentId}`;
  try {
    const ref = doc(db, 'residents', residentId);
    await deleteDoc(ref);

    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara / Pengurus',
      role: 'BENDAHARA',
      action: 'HAPUS_WARGA',
      detail: `Menghapus data warga ${residentName || residentId} di unit ${unitCode || ''} dari database.`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Update resident data in Firestore
export async function updateResidentInFirestore(residentId: string, updates: Partial<Resident>): Promise<void> {
  const path = `residents/${residentId}`;
  try {
    const ref = doc(db, 'residents', residentId);
    await setDoc(ref, cleanFirestoreData(updates), { merge: true });

    // Also record audit log
    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara / Pengurus',
      role: 'BENDAHARA',
      action: 'UPDATE_WARGA',
      detail: `Memperbarui profil data warga ${updates.nama || residentId} di unit ${updates.blok || ''}`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Update resident contact (phone/WhatsApp) by resident with transparent audit log
export async function updateResidentContactInFirestore(
  residentId: string,
  newPhone: string,
  residentName: string,
  unitBlock: string,
  oldPhone?: string
): Promise<void> {
  const path = `residents/${residentId}`;
  try {
    const ref = doc(db, 'residents', residentId);
    await setDoc(ref, cleanFirestoreData({ noWhatsapp: newPhone }), { merge: true });

    // Record audit log entry for transparency
    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: `${residentName} (Warga Kavling ${unitBlock})`,
      role: 'WARGA',
      action: 'UPDATE_KONTAK_WARGA',
      detail: `Warga unit ${unitBlock} (${residentName}) memperbarui kontak nomor WhatsApp dari "${oldPhone || '-'}" menjadi "${newPhone}".`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Update resident PIN with dual-write to Firestore and transparent audit log
export async function updateResidentPinInFirestore(
  residentId: string,
  newPin: string,
  residentName: string,
  unitBlock: string,
  actor: string = 'Admin Paguyuban',
  role: Role = 'BENDAHARA'
): Promise<void> {
  const path = `residents/${residentId}`;
  try {
    const ref = doc(db, 'residents', residentId);
    await setDoc(ref, cleanFirestoreData({ pin: newPin }), { merge: true });

    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action: 'UPDATE_PIN_WARGA',
      detail: `${actor} (${role}) memperbarui PIN akses warga unit ${unitBlock} (${residentName}) menjadi PIN baru.`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}


// Update a specific month payment status for a resident
export async function updateResidentMonthStatusInFirestore(
  resident: Resident,
  month: MonthKey,
  status: MonthPaymentStatus,
  amount: number = 100000
): Promise<void> {
  const path = `residents/${resident.id}`;
  try {
    const updatedLedger: Record<MonthKey, MonthlyLedgerItem> = {
      ...(resident.monthlyLedger || ({} as Record<MonthKey, MonthlyLedgerItem>)),
      [month]: {
        status,
        amount: (status === 'LUNAS' || status === 'MENUNGGAK') ? amount : 0,
        paidDate: status === 'LUNAS' ? new Date().toISOString().split('T')[0] : undefined,
        note: month === 'Jan' ? 'Mulai setor Februari' : undefined
      }
    };

    // Recalculate totals
    let totalSetoran = 0;
    const bulanMenunggakList: string[] = [];

    MONTH_KEYS.forEach((mKey) => {
      const item = updatedLedger[mKey];
      if (item?.status === 'LUNAS') {
        totalSetoran += item.amount || IPL_TARIFF;
      } else if (item?.status === 'MENUNGGAK') {
        bulanMenunggakList.push(MONTH_LABELS[mKey]);
      }
    });

    const totalTunggakan = bulanMenunggakList.length * IPL_TARIFF;

    let statusBulanIni: 'Lunas' | 'Belum Bayar' | 'Menunggak' = 'Belum Bayar';
    if (updatedLedger.Sep?.status === 'LUNAS') {
      statusBulanIni = 'Lunas';
    } else if (updatedLedger.Sep?.status === 'MENUNGGAK' || totalTunggakan > 0) {
      statusBulanIni = 'Menunggak';
    } else if (resident.nama && !resident.nama.includes('(Belum Tercatat')) {
      statusBulanIni = 'Belum Bayar';
    }

    const ref = doc(db, 'residents', resident.id);
    const updatePayload: any = {
      monthlyLedger: updatedLedger,
      totalSetoran,
      totalTunggakan,
      bulanMenunggak: bulanMenunggakList,
      statusBulanIni
    };
    if (status === 'LUNAS') {
      updatePayload.lastPaymentDate = new Date().toISOString().split('T')[0];
    } else if (resident.lastPaymentDate) {
      updatePayload.lastPaymentDate = resident.lastPaymentDate;
    }
    await updateDoc(ref, cleanFirestoreData(updatePayload));

    // Record audit log
    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara Paguyuban',
      role: 'BENDAHARA',
      action: 'UPDATE_STATUS_IURAN',
      detail: `Ubah status iuran bulan ${month} unit ${resident.blok} (${resident.nama}) menjadi ${status}`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Record digital payment (QRIS, VA, Transfer)
export async function recordPaymentInFirestore(payload: {
  resident: Resident;
  months: string[];
  amount: number;
  method: string;
  actorName: string;
}): Promise<Transaction> {
  const txPath = 'transactions';
  try {
    const txId = `trx-${Date.now()}`;
    const receiptNum = `KW/SK/${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: Transaction = {
      id: txId,
      nomorTransaksi: `TRX-SK-${Date.now().toString().slice(-6)}`,
      tanggal: new Date().toISOString(),
      tipe: 'PEMASUKAN',
      kategori: 'Iuran IPL Warga',
      nominal: payload.amount,
      keterangan: `Pembayaran Iuran IPL (${payload.months.join(', ')}) oleh ${payload.resident.nama} (${payload.resident.blok})`,
      wargaId: payload.resident.id,
      namaWarga: payload.resident.nama,
      blokWarga: payload.resident.blok,
      bulanDibayar: payload.months.join(', '),
      metodePembayaran: payload.method as any,
      penanggungJawab: payload.actorName || 'Sistem Pembayaran Digital',
      status: 'BERHASIL',
      noKwitansi: receiptNum
    };

    // 1. Save Transaction Doc
    await setDoc(doc(db, 'transactions', txId), newTx);

    // 2. Update Resident Monthly Ledger
    const updatedLedger: Record<MonthKey, MonthlyLedgerItem> = {
      ...(payload.resident.monthlyLedger || ({} as Record<MonthKey, MonthlyLedgerItem>))
    };

    const monthAbbrMap: Record<string, MonthKey> = {
      'Januari': 'Jan', 'Februari': 'Feb', 'Maret': 'Mar', 'April': 'Apr',
      'Mei': 'Mei', 'Juni': 'Jun', 'Juli': 'Jul', 'Agustus': 'Agt',
      'September': 'Sep', 'Oktober': 'Okt', 'November': 'Nov', 'Desember': 'Des'
    };

    payload.months.forEach((mStr) => {
      const monthPrefix = mStr.split(' ')[0];
      const mKey = monthAbbrMap[monthPrefix] || (mStr as MonthKey);
      if (mKey && updatedLedger[mKey]) {
        updatedLedger[mKey] = {
          status: 'LUNAS',
          amount: IPL_TARIFF,
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
    });

    let totalSetoran = (payload.resident.totalSetoran || 0) + payload.amount;
    const bulanMenunggakList = (payload.resident.bulanMenunggak || []).filter(
      (m) => !payload.months.some((pm) => m.toLowerCase().includes(pm.toLowerCase()))
    );
    const totalTunggakan = bulanMenunggakList.length * IPL_TARIFF;

    await updateDoc(doc(db, 'residents', payload.resident.id), {
      monthlyLedger: updatedLedger,
      totalSetoran,
      totalTunggakan,
      bulanMenunggak: bulanMenunggakList,
      statusBulanIni: 'Lunas',
      lastPaymentDate: new Date().toISOString().split('T')[0]
    });

    // 3. Save Audit Log
    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: payload.actorName || payload.resident.nama,
      role: 'WARGA',
      action: 'PEMBAYARAN_IPL_ONLINE',
      detail: `Pembayaran ${payload.method} sebesar Rp ${payload.amount.toLocaleString('id-ID')} untuk unit ${payload.resident.blok} berhasil diproses.`
    });

    return newTx;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, txPath);
  }
}

// Record neighborhood expense
export async function recordExpenseInFirestore(payload: {
  kategori: string;
  nominal: number;
  keterangan: string;
  penanggungJawab: string;
}): Promise<Transaction> {
  const txPath = 'transactions';
  try {
    const txId = `trx-exp-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      nomorTransaksi: `EXP-SK-${Date.now().toString().slice(-6)}`,
      tanggal: new Date().toISOString(),
      tipe: 'PENGELUARAN',
      kategori: payload.kategori,
      nominal: payload.nominal,
      keterangan: payload.keterangan,
      penanggungJawab: payload.penanggungJawab,
      status: 'BERHASIL'
    };

    await setDoc(doc(db, 'transactions', txId), newTx);

    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: payload.penanggungJawab,
      role: 'BENDAHARA',
      action: 'PENCATATAN_PENGELUARAN',
      detail: `Pengeluaran ${payload.kategori} sebesar Rp ${payload.nominal.toLocaleString('id-ID')}: ${payload.keterangan}`
    });

    return newTx;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, txPath);
  }
}

// Sync/Update all resident payment dues up to September 2026 in Firestore
export async function syncFirestoreRosterDuesUpToSeptember(): Promise<{ success: boolean; count: number; totalPaidB6B7: number }> {
  const path = 'residents';
  try {
    const updatedResidents = buildResidentsFromRoster();
    const batch = writeBatch(db);

    let totalB6B7 = 0;
    updatedResidents.forEach((res) => {
      const ref = doc(db, 'residents', res.id);
      // Merge updates the ledger and financial metrics while preserving other custom fields
      const docData: any = {
        nama: res.nama,
        statusHunian: res.statusHunian,
        monthlyLedger: res.monthlyLedger,
        totalSetoran: res.totalSetoran,
        totalTunggakan: res.totalTunggakan,
        bulanMenunggak: res.bulanMenunggak,
        statusBulanIni: res.statusBulanIni
      };
      if (res.lastPaymentDate) {
        docData.lastPaymentDate = res.lastPaymentDate;
      }
      batch.set(ref, cleanFirestoreData(docData), { merge: true });

      if (['B6', 'B7'].includes(res.blokGroup) && res.totalSetoran) {
        totalB6B7 += res.totalSetoran;
      }
    });

    // Update settings version
    const settingsRef = doc(db, 'settings', 'general');
    batch.set(settingsRef, {
      rosterVersion: '2026.09.v4',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Record audit log
    const logId = `log-${Date.now()}`;
    batch.set(doc(db, 'auditLogs', logId), {
      id: logId,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara / Pengurus',
      role: 'BENDAHARA',
      action: 'UPDATE_IURAN_SEPTEMBER',
      detail: `Sinkronisasi database iuran sampai September 2026 untuk 141 unit. Total masuk B6+B7: Rp 23.500.000.`
    });

    await batch.commit();
    return { success: true, count: updatedResidents.length, totalPaidB6B7: totalB6B7 };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

