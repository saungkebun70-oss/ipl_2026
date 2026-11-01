export type Role = 'KETUA' | 'BENDAHARA' | 'WARGA';

export type MonthPaymentStatus = 'LUNAS' | 'MENUNGGAK' | 'KOSONG' | 'BELUM_BAYAR';
export type MonthKey = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'Mei' | 'Jun' | 'Jul' | 'Agt' | 'Sep' | 'Okt' | 'Nov' | 'Des';

export interface MonthlyLedgerItem {
  status: MonthPaymentStatus;
  amount: number; // 100000 if LUNAS or MENUNGGAK, 0 if KOSONG or BELUM_BAYAR
  note?: string;
  paidDate?: string;
}

export interface Resident {
  id: string;
  blok: string; // e.g. "B03/01", "B05/21"
  blokGroup: string; // "B3" | "B5" | "B6" | "B7" | "B8" | "B8-Ext"
  nomorRumah: string;
  nama: string;
  noWhatsapp: string;
  statusHunian: 'Dihuni Tetap' | 'Disewa/Kontrak' | 'Rumah Kosong';
  tipeRumah: 'Standar' | 'Hook';
  tagihanBulanan: number; // Standar Rp 100.000 / bulan
  statusBulanIni: 'Lunas' | 'Belum Bayar' | 'Menunggak';
  bulanMenunggak: string[]; // e.g. ["Juni 2026", "Juli 2026"]
  totalTunggakan: number;
  lastPaymentDate?: string;
  pin: string; // Default '1234'
  monthlyLedger?: Record<MonthKey, MonthlyLedgerItem>;
  totalSetoran?: number; // Total iuran terbayar (Rp)
}

export type TransactionType = 'PEMASUKAN' | 'PENGELUARAN';

export interface Transaction {
  id: string;
  nomorTransaksi: string; // e.g. "TRX-SK-202610-001"
  tanggal: string; // ISO string
  tipe: TransactionType;
  kategori: string;
  nominal: number;
  keterangan: string;
  wargaId?: string;
  namaWarga?: string;
  blokWarga?: string;
  bulanDibayar?: string;
  metodePembayaran?: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI' | 'EWALLET_GOPAY' | 'EWALLET_DANA' | 'TRANSFER_MANUAL' | 'TUNAI_BENDAHARA';
  penanggungJawab: string;
  status: 'BERHASIL' | 'MENUNGGU_VERIFIKASI' | 'DITOLAK';
  buktiUrl?: string;
  noKwitansi?: string;
}

export interface PaymentIntent {
  id: string;
  invoiceNumber: string;
  residentId: string;
  residentName: string;
  blok: string;
  months: string[];
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  method: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI' | 'EWALLET_GOPAY' | 'EWALLET_DANA' | 'TRANSFER_MANUAL';
  vaNumber?: string;
  qrisPayload?: string;
  expiredAt: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  createdAt: string;
}

export interface WhatsAppNotification {
  id: string;
  timestamp: string;
  targetPhone: string;
  targetName: string;
  targetBlok: string;
  type: 'PEMBAYARAN_SUKSES' | 'TAGIHAN_BULANAN' | 'LAPORAN_TRANSPARANSI';
  message: string;
  status: 'SENT' | 'QUEUED';
  directLink: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  detail: string;
}

export interface FinancialSummary {
  saldoKasSaatIni: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  totalWarga: number;
  totalWargaLunas: number;
  totalWargaBelumBayar: number;
  persentaseKepatuhan: number;
  targetKasBulanIni: number;
  totalTunggakanWarga: number;
}

export interface OrganizationOfficer {
  jabatan: string;
  nama: string;
  blok: string;
  roleType: 'PEMBINA' | 'KETUA' | 'BENDAHARA' | 'HUMAS' | 'SEKSI_OLAHRAGA';
  tugas: string;
  phone?: string;
}

