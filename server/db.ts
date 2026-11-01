import fs from 'fs';
import path from 'path';
import { Resident, Transaction, AuditLog, WhatsAppNotification, FinancialSummary, OrganizationOfficer, MonthKey, MonthPaymentStatus } from '../src/types/index';
import { buildResidentsFromRoster, MONTH_LABELS, IPL_TARIFF } from './saungKebunRosterData.ts';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'saung_kebun_db.json');

export const ORGANIZATIONAL_STRUCTURE: OrganizationOfficer[] = [
  {
    jabatan: 'Pembina Paguyuban',
    nama: 'Bp. Iwan',
    blok: 'Blok B08/05',
    roleType: 'PEMBINA',
    tugas: 'Pengarah kebijakan umum, penasehat paguyuban & mediasi warga',
    phone: '081289550805'
  },
  {
    jabatan: 'Ketua Paguyuban',
    nama: 'Bp. Erlangga',
    blok: 'Blok B03/07',
    roleType: 'KETUA',
    tugas: 'Penanggung jawab utama operasional lingkungan, keamanan, ketertiban & fasilitas Saung Kebun',
    phone: '081298765432'
  },
  {
    jabatan: 'Bendahara Kas IPL',
    nama: 'Bp. Andriansyah',
    blok: 'Blok B07/16',
    roleType: 'BENDAHARA',
    tugas: 'Pengelolaan kas iuran bulanan, pembukuan keuangan real-time & verifikasi pembayaran',
    phone: '081287654321'
  },
  {
    jabatan: 'Humas Paguyuban (Koordinator)',
    nama: 'Bp. Doni',
    blok: 'Blok B05/21',
    roleType: 'HUMAS',
    tugas: 'Penyampaian maklumat resmi, komunikasi antar warga & hubungan eksternal perumahan',
    phone: '081234567821'
  },
  {
    jabatan: 'Humas Paguyuban (Anggota)',
    nama: 'Bp. Wahyu',
    blok: 'Blok B05/24',
    roleType: 'HUMAS',
    tugas: 'Sosialisasi kegiatan warga, penampung aspirasi lingkungan & dokumentasi publikasi',
    phone: '081234567824'
  },
  {
    jabatan: 'Seksi Olahraga & Kegiatan',
    nama: 'Bp. Deni',
    blok: 'Blok B08/06',
    roleType: 'SEKSI_OLAHRAGA',
    tugas: 'Pengembangan kegiatan olahraga warga, senam sehat bersama & perawatan lapangan sarana olahraga',
    phone: '081234567806'
  }
];

const FIRST_NAMES = [
  'Hendra', 'Budi', 'Ahmad', 'Agus', 'Bambang', 'Dedi', 'Eko', 'Fajar', 'Gunawan',
  'Hadi', 'Irfan', 'Joko', 'Kurniawan', 'Lukman', 'Mulyadi', 'Nur', 'Oki', 'Prasetyo',
  'Rian', 'Siti', 'Tri', 'Untung', 'Wahyu', 'Yanto', 'Zainal', 'Ratna', 'Dewi',
  'Sri', 'Nurul', 'Indah', 'Lestari', 'Wulandari', 'Rini', 'Dian', 'Maya', 'Fitri'
];

const LAST_NAMES = [
  'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Hidayat', 'Saputra', 'Setiawan',
  'Suryono', 'Firmansyah', 'Nugroho', 'Purnomo', 'Syahputra', 'Siregar', 'Harahap',
  'Lubis', 'Pasaribu', 'Nasution', 'Subagyo', 'Wibowo', 'Prabowo', 'Utomo', 'Susanto'
];

interface DatabaseSchema {
  residents: Resident[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  notifications: WhatsAppNotification[];
  officers: OrganizationOfficer[];
  settings: {
    estateName: string;
    associationName: string;
    standardTariff: number;
    hookTariff: number;
    treasurerName: string;
    treasurerPhone: string;
    treasurerBlock: string;
    chairmanName: string;
    chairmanPhone: string;
    chairmanBlock: string;
    adviserName: string;
    adviserBlock: string;
    currentMonth: string;
    accountNumbers: {
      bca: string;
      mandiri: string;
      bri: string;
      bni: string;
    };
  };
}

function generateInitialResidents(): Resident[] {
  return buildResidentsFromRoster();
}

function generateInitialTransactions(residents: Resident[]): Transaction[] {
  const txs: Transaction[] = [];
  let txCounter = 1;

  // Initial cash surplus from previous period
  txs.push({
    id: `trx-${txCounter++}`,
    nomorTransaksi: `TRX-SK-202610-001`,
    tanggal: `2026-10-01T07:00:00.000Z`,
    tipe: 'PEMASUKAN',
    kategori: 'Saldo Awal Kas Paguyuban',
    nominal: 18500000,
    keterangan: 'Sisa saldo kas umum perumahan Saung Kebun periode September 2026',
    penanggungJawab: 'Bendahara (Bp. Andriansyah)',
    status: 'BERHASIL'
  });

  // Monthly operating expenditures
  const expenses = [
    {
      tanggal: '2026-10-01',
      kategori: 'Gaji Keamanan (Satpam)',
      nominal: 4400000,
      keterangan: 'Honor 2 petugas satpam jaga shift siang & malam bulan Oktober 2026',
      penanggungJawab: 'Bendahara (Bp. Andriansyah)',
    },
    {
      tanggal: '2026-10-03',
      kategori: 'Retribusi Kebersihan & Sampah',
      nominal: 2800000,
      keterangan: 'Iuran armada truk sampah DLH & 1 petugas gerobak lingkungan',
      penanggungJawab: 'Bendahara (Bp. Andriansyah)',
    },
    {
      tanggal: '2026-10-05',
      kategori: 'Listrik Fasum & PJU',
      nominal: 1450000,
      keterangan: 'Pembayaran token PLN 3 gardu PJU penerangan jalan warga dan pos kamling',
      penanggungJawab: 'Bendahara (Bp. Andriansyah)',
    },
    {
      tanggal: '2026-10-12',
      kategori: 'Perawatan Sarana & Fogging',
      nominal: 580000,
      keterangan: 'Pembelian obat malathion & operasional mesin fogging pencegahan jentik nyamuk',
      penanggungJawab: 'Ketua (Bp. Erlangga)',
    },
    {
      tanggal: '2026-10-18',
      kategori: 'Pemeliharaan Taman & CCTV',
      nominal: 350000,
      keterangan: 'Penggantian adaptor power CCTV gerbang utama & bensin mesin potong rumput',
      penanggungJawab: 'Bendahara (Bp. Andriansyah)',
    },
    {
      tanggal: '2026-10-24',
      kategori: 'Santunan Sosial & Duka',
      nominal: 500000,
      keterangan: 'Uang santunan duka cita kas sosial untuk keluarga warga Blok B',
      penanggungJawab: 'Ketua (Bp. Erlangga)',
    }
  ];

  for (const exp of expenses) {
    txs.push({
      id: `trx-${txCounter++}`,
      nomorTransaksi: `TRX-SK-202610-${txCounter.toString().padStart(3, '0')}`,
      tanggal: `${exp.tanggal}T09:15:00.000Z`,
      tipe: 'PENGELUARAN',
      kategori: exp.kategori,
      nominal: exp.nominal,
      keterangan: exp.keterangan,
      penanggungJawab: exp.penanggungJawab,
      status: 'BERHASIL'
    });
  }

  // Resident payments for all residents marked 'Lunas'
  const paidResidents = residents.filter(r => r.statusBulanIni === 'Lunas');
  for (const r of paidResidents) {
    const paymentMethods: ('QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'EWALLET_GOPAY' | 'TRANSFER_MANUAL')[] = [
      'QRIS', 'VA_BCA', 'VA_MANDIRI', 'EWALLET_GOPAY', 'TRANSFER_MANUAL'
    ];
    const method = paymentMethods[txCounter % paymentMethods.length];
    const day = (1 + (txCounter % 28)).toString().padStart(2, '0');

    txs.push({
      id: `trx-${txCounter++}`,
      nomorTransaksi: `TRX-SK-202610-${txCounter.toString().padStart(3, '0')}`,
      tanggal: `2026-10-${day}T10:30:00.000Z`,
      tipe: 'PEMASUKAN',
      kategori: 'Iuran IPL Warga',
      nominal: r.tagihanBulanan,
      keterangan: `Pembayaran Iuran IPL Bulan Oktober 2026 oleh ${r.nama} (${r.blok})`,
      wargaId: r.id,
      namaWarga: r.nama,
      blokWarga: r.blok,
      bulanDibayar: 'Oktober 2026',
      metodePembayaran: method,
      penanggungJawab: 'Sistem Pembayaran Digital',
      status: 'BERHASIL',
      noKwitansi: `KW/SK/202610/${txCounter.toString().padStart(4, '0')}`
    });
  }

  return txs;
}

function initializeDatabase(): DatabaseSchema {
  const residents = generateInitialResidents();
  const transactions = generateInitialTransactions(residents);

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: '2026-10-01T08:00:00.000Z',
      actor: 'Sistem Kas Saung Kebun',
      role: 'BENDAHARA',
      action: 'GENERASI_TAGIHAN_BULANAN',
      detail: `Otomatis generate tagihan IPL 115 unit rumah untuk periode berjalan.`
    },
    {
      id: 'log-2',
      timestamp: '2026-10-05T14:20:00.000Z',
      actor: 'Bp. Andriansyah (Bendahara)',
      role: 'BENDAHARA',
      action: 'INPUT_PENGELUARAN',
      detail: 'Mencatat pengeluaran operasional retribusi sampah dan honor satpam.'
    }
  ];

  const notifications: WhatsAppNotification[] = [
    {
      id: 'notif-1',
      timestamp: '2026-10-25T11:00:00.000Z',
      targetPhone: '081298765432',
      targetName: 'Bp. Erlangga',
      targetBlok: 'B03/07',
      type: 'PEMBAYARAN_SUKSES',
      message: 'Halo Bp. Erlangga (Blok B03/07), Pembayaran IPL Saung Kebun Anda sebesar Rp 150.000 telah BERHASIL diverifikasi. No Kwitansi: KW/SK/202610/0042. Terima kasih atas partisipasi aktif menjaga lingkungan kita.',
      status: 'SENT',
      directLink: 'https://api.whatsapp.com/send?phone=6281298765432'
    }
  ];

  return {
    residents,
    transactions,
    auditLogs,
    notifications,
    officers: ORGANIZATIONAL_STRUCTURE,
    settings: {
      estateName: 'Perumahan Saung Kebun',
      associationName: 'Paguyuban Pengurus Perumahan Saung Kebun',
      standardTariff: 100000,
      hookTariff: 100000,
      treasurerName: 'Bp. Andriansyah',
      treasurerPhone: '081287654321',
      treasurerBlock: 'Blok B07/16',
      chairmanName: 'Bp. Erlangga',
      chairmanPhone: '081298765432',
      chairmanBlock: 'Blok B03/07',
      adviserName: 'Bp. Iwan',
      adviserBlock: 'Blok B08/05',
      currentMonth: 'September 2026',
      accountNumbers: {
        bca: '8809912040901',
        mandiri: '8950812040901',
        bri: '1289012040901',
        bni: '988012040901'
      }
    }
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure new authentic Saung Kebun roster is active
        const isOldData = !this.data.residents || 
          this.data.residents.length === 0 || 
          !this.data.residents[0]?.monthlyLedger ||
          this.data.settings?.standardTariff !== IPL_TARIFF ||
          this.data.residents.some(r => r.id === 'res-a-01');
        if (isOldData) {
          this.data = initializeDatabase();
          this.save();
        } else if (!this.data.officers || this.data.officers.length === 0) {
          this.data.officers = ORGANIZATIONAL_STRUCTURE;
          this.save();
        }
      } catch {
        this.data = initializeDatabase();
        this.save();
      }
    } else {
      this.data = initializeDatabase();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public getResidents(): Resident[] {
    return this.data.residents;
  }

  public getOfficers(): OrganizationOfficer[] {
    return this.data.officers || ORGANIZATIONAL_STRUCTURE;
  }

  public getResidentById(id: string): Resident | undefined {
    return this.data.residents.find(r => r.id === id);
  }

  public getResidentByBlok(blok: string): Resident | undefined {
    const clean = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const targetClean = clean(blok);
    return this.data.residents.find(r => {
      const rClean = clean(r.blok);
      return (
        rClean === targetClean ||
        rClean.replace(/^B0?/, 'B') === targetClean.replace(/^B0?/, 'B') ||
        r.blok.toUpperCase() === blok.trim().toUpperCase()
      );
    });
  }

  public addResident(residentData: Partial<Resident>): Resident {
    const rawBlok = (residentData.blok || 'B3/99').trim();
    const parts = rawBlok.split('/');
    const blokGroup = residentData.blokGroup || parts[0] || 'B3';
    const num = parts[1] || '01';
    const id = residentData.id || `res-${blokGroup.toLowerCase().replace(/[^a-z0-9]/g, '')}-${num.padStart(2, '0')}`;

    const newResident: Resident = {
      id,
      blok: rawBlok,
      blokGroup,
      nomorRumah: num.padStart(2, '0'),
      nama: residentData.nama?.trim() || '(Warga Baru)',
      noWhatsapp: residentData.noWhatsapp?.trim() || '-',
      statusHunian: residentData.statusHunian || 'Dihuni Tetap',
      tipeRumah: residentData.tipeRumah || 'Standar',
      tagihanBulanan: residentData.tagihanBulanan || IPL_TARIFF,
      statusBulanIni: residentData.statusBulanIni || 'Belum Bayar',
      bulanMenunggak: [],
      totalTunggakan: 0,
      totalSetoran: 0,
      pin: residentData.pin || '1234',
      monthlyLedger: residentData.monthlyLedger || {
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

    this.data.residents.push(newResident);

    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara (Bp. Andriansyah)',
      role: 'BENDAHARA',
      action: 'TAMBAH_WARGA',
      detail: `Menambahkan warga baru unit ${newResident.blok} atas nama ${newResident.nama}.`
    });

    this.save();
    return newResident;
  }

  public deleteResident(id: string): boolean {
    const idx = this.data.residents.findIndex(r => r.id === id);
    if (idx === -1) {
      throw new Error('Warga tidak ditemukan');
    }
    const [deleted] = this.data.residents.splice(idx, 1);

    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara (Bp. Andriansyah)',
      role: 'BENDAHARA',
      action: 'HAPUS_WARGA',
      detail: `Menghapus data warga unit ${deleted.blok} (${deleted.nama}).`
    });

    this.save();
    return true;
  }

  public updateResident(id: string, updates: Partial<Resident>): Resident {
    const resident = this.data.residents.find(r => r.id === id);
    if (!resident) {
      throw new Error('Warga tidak ditemukan');
    }

    // Apply updates
    Object.assign(resident, updates);

    // If marked as Dihuni Tetap or name changed from Kosong, ensure valid status
    if (updates.statusHunian && updates.statusHunian !== 'Rumah Kosong' && resident.statusHunian === 'Rumah Kosong') {
      resident.statusHunian = updates.statusHunian;
    }

    // Recalculate monthly totals if monthlyLedger was updated
    if (resident.monthlyLedger) {
      let setoran = 0;
      const menunggakList: string[] = [];
      const keys = Object.keys(resident.monthlyLedger) as MonthKey[];
      for (const k of keys) {
        const item = resident.monthlyLedger[k];
        if (item.status === 'LUNAS') {
          setoran += item.amount || IPL_TARIFF;
        } else if (item.status === 'MENUNGGAK') {
          menunggakList.push(MONTH_LABELS[k] || k);
        }
      }
      resident.totalSetoran = setoran;
      resident.bulanMenunggak = menunggakList;
      resident.totalTunggakan = menunggakList.length * (resident.tagihanBulanan || IPL_TARIFF);
      if (resident.monthlyLedger.Sep?.status === 'LUNAS') {
        resident.statusBulanIni = 'Lunas';
      } else if (resident.totalTunggakan > 0) {
        resident.statusBulanIni = 'Menunggak';
      }
    }

    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara (Bp. Andriansyah)',
      role: 'BENDAHARA',
      action: 'UPDATE_DATA_WARGA',
      detail: `Pembaruan data warga unit ${resident.blok} (${resident.nama}). Status: ${resident.statusHunian}.`
    });

    this.save();
    return resident;
  }

  public updateResidentMonthStatus(
    id: string,
    month: MonthKey,
    status: MonthPaymentStatus,
    amount: number = IPL_TARIFF
  ): Resident {
    const resident = this.data.residents.find(r => r.id === id);
    if (!resident) {
      throw new Error('Warga tidak ditemukan');
    }

    if (!resident.monthlyLedger) {
      resident.monthlyLedger = {
        Jan: { status: 'KOSONG', amount: 0 },
        Feb: { status: 'KOSONG', amount: 0 },
        Mar: { status: 'KOSONG', amount: 0 },
        Apr: { status: 'KOSONG', amount: 0 },
        Mei: { status: 'KOSONG', amount: 0 },
        Jun: { status: 'KOSONG', amount: 0 },
        Jul: { status: 'KOSONG', amount: 0 },
        Agt: { status: 'KOSONG', amount: 0 },
        Sep: { status: 'KOSONG', amount: 0 },
        Okt: { status: 'BELUM_BAYAR', amount: 0 },
        Nov: { status: 'BELUM_BAYAR', amount: 0 },
        Des: { status: 'BELUM_BAYAR', amount: 0 }
      };
    }

    const cellAmount = (status === 'LUNAS' || status === 'MENUNGGAK') ? (amount || IPL_TARIFF) : 0;
    const oldStatus = resident.monthlyLedger[month]?.status || 'KOSONG';

    resident.monthlyLedger[month] = {
      status,
      amount: cellAmount,
      paidDate: status === 'LUNAS' ? new Date().toISOString().split('T')[0] : undefined,
      note: status === 'MENUNGGAK' ? 'Menunggak iuran' : undefined
    };

    // Recalculate totals
    let setoran = 0;
    const menunggakList: string[] = [];
    const keys = Object.keys(resident.monthlyLedger) as MonthKey[];
    for (const k of keys) {
      const item = resident.monthlyLedger[k];
      if (item.status === 'LUNAS') {
        setoran += item.amount || IPL_TARIFF;
      } else if (item.status === 'MENUNGGAK') {
        menunggakList.push(MONTH_LABELS[k] || k);
      }
    }

    resident.totalSetoran = setoran;
    resident.bulanMenunggak = menunggakList;
    resident.totalTunggakan = menunggakList.length * (resident.tagihanBulanan || IPL_TARIFF);

    if (resident.monthlyLedger.Sep?.status === 'LUNAS') {
      resident.statusBulanIni = 'Lunas';
    } else if (resident.totalTunggakan > 0) {
      resident.statusBulanIni = 'Menunggak';
    } else {
      resident.statusBulanIni = 'Belum Bayar';
    }

    // Add transaction if marked as LUNAS
    if (status === 'LUNAS' && oldStatus !== 'LUNAS') {
      const txCount = this.data.transactions.length + 1;
      const dateStr = new Date().toISOString();
      const invoiceNum = `KW/SK/${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${txCount.toString().padStart(4, '0')}`;
      
      const newTx: Transaction = {
        id: `trx-${Date.now()}`,
        nomorTransaksi: `TRX-SK-${Date.now().toString().slice(-6)}`,
        tanggal: dateStr,
        tipe: 'PEMASUKAN',
        kategori: 'Iuran IPL Warga',
        nominal: cellAmount,
        keterangan: `Pembayaran Iuran IPL Bulan ${MONTH_LABELS[month]} oleh ${resident.nama} (${resident.blok})`,
        wargaId: resident.id,
        namaWarga: resident.nama,
        blokWarga: resident.blok,
        bulanDibayar: MONTH_LABELS[month],
        metodePembayaran: 'TUNAI_BENDAHARA',
        penanggungJawab: 'Bendahara (Bp. Andriansyah)',
        status: 'BERHASIL',
        noKwitansi: invoiceNum
      };
      this.data.transactions.unshift(newTx);
    }

    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Bendahara (Bp. Andriansyah)',
      role: 'BENDAHARA',
      action: 'UPDATE_STATUS_BULANAN_IPL',
      detail: `Ubah status ${resident.blok} (${resident.nama}) bulan ${MONTH_LABELS[month]}: [${oldStatus}] ➔ [${status}].`
    });

    this.save();
    return resident;
  }


  public getTransactions(): Transaction[] {
    return [...this.data.transactions].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getNotifications(): WhatsAppNotification[] {
    return [...this.data.notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getSettings() {
    return this.data.settings;
  }

  public recordPayment(params: {
    residentId: string;
    months: string[];
    amount: number;
    method: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI' | 'EWALLET_GOPAY' | 'EWALLET_DANA' | 'TRANSFER_MANUAL' | 'TUNAI_BENDAHARA';
    actorName: string;
  }): { transaction: Transaction; resident: Resident; notification: WhatsAppNotification } {
    const resident = this.getResidentById(params.residentId);
    if (!resident) {
      throw new Error('Warga tidak ditemukan');
    }

    const txCount = this.data.transactions.length + 1;
    const dateStr = new Date().toISOString();
    const invoiceNum = `KW/SK/${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${txCount.toString().padStart(4, '0')}`;

    const newTx: Transaction = {
      id: `trx-${Date.now()}`,
      nomorTransaksi: `TRX-SK-${Date.now().toString().slice(-6)}`,
      tanggal: dateStr,
      tipe: 'PEMASUKAN',
      kategori: 'Iuran IPL Warga',
      nominal: params.amount,
      keterangan: `Pembayaran Iuran IPL (${params.months.join(', ')}) oleh ${resident.nama} (${resident.blok})`,
      wargaId: resident.id,
      namaWarga: resident.nama,
      blokWarga: resident.blok,
      bulanDibayar: params.months.join(', '),
      metodePembayaran: params.method,
      penanggungJawab: params.actorName,
      status: 'BERHASIL',
      noKwitansi: invoiceNum
    };

    resident.statusBulanIni = 'Lunas';
    resident.lastPaymentDate = dateStr.split('T')[0];
    resident.bulanMenunggak = resident.bulanMenunggak.filter(m => !params.months.includes(m));
    resident.totalTunggakan = Math.max(0, resident.bulanMenunggak.length * resident.tagihanBulanan);

    this.data.transactions.push(newTx);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actor: params.actorName,
      role: 'WARGA',
      action: 'PEMBAYARAN_DIGITAL_IPL',
      detail: `Pembayaran ${invoiceNum} sebesar Rp ${params.amount.toLocaleString('id-ID')} via ${params.method} untuk ${resident.nama} (${resident.blok}).`
    };
    this.data.auditLogs.push(newLog);

    const cleanPhone = resident.noWhatsapp.startsWith('0') ? '62' + resident.noWhatsapp.slice(1) : resident.noWhatsapp;
    const waMessage = `🏛️ *TANDA TERIMA RESMI IPL SAUNG KEBUN*\n\n` +
      `Kepada Yth: *${resident.nama}*\n` +
      `Alamat: *${resident.blok}*, Perumahan Saung Kebun\n` +
      `No. Kwitansi: *${invoiceNum}*\n` +
      `Status: *LUNAS & TERVERIFIKASI* ✅\n\n` +
      `• Periode: ${params.months.join(', ')}\n` +
      `• Nominal: *Rp ${params.amount.toLocaleString('id-ID')}*\n` +
      `• Metode: ${params.method}\n` +
      `• Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n` +
      `Rincian Alokasi Iuran:\n` +
      `- Kebersihan & Sampah Lingkungan: Rp 45.000\n` +
      `- Pos Keamanan & Satpam 24 Jam: Rp 65.000\n` +
      `- Listrik Penerangan Jalan & Fasum: Rp 25.000\n` +
      `- Kas Sosial & Pemeliharaan: Rp ${resident.tipeRumah === 'Hook' ? '45.000' : '15.000'}\n\n` +
      `Terima kasih atas kontribusi aktif menjaga kenyamanan lingkungan Saung Kebun.\n_Pengurus Paguyuban Saung Kebun_\nKetua: Bp. Erlangga · Bendahara: Bp. Andriansyah`;

    const waNotif: WhatsAppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: dateStr,
      targetPhone: resident.noWhatsapp,
      targetName: resident.nama,
      targetBlok: resident.blok,
      type: 'PEMBAYARAN_SUKSES',
      message: waMessage,
      status: 'SENT',
      directLink: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMessage)}`
    };
    this.data.notifications.push(waNotif);

    this.save();
    return { transaction: newTx, resident, notification: waNotif };
  }

  public addExpense(params: {
    kategori: string;
    nominal: number;
    keterangan: string;
    penanggungJawab: string;
    buktiUrl?: string;
  }): Transaction {
    const txCount = this.data.transactions.length + 1;
    const dateStr = new Date().toISOString();

    const newTx: Transaction = {
      id: `trx-${Date.now()}`,
      nomorTransaksi: `TRX-SK-${Date.now().toString().slice(-6)}`,
      tanggal: dateStr,
      tipe: 'PENGELUARAN',
      kategori: params.kategori,
      nominal: params.nominal,
      keterangan: params.keterangan,
      penanggungJawab: params.penanggungJawab,
      status: 'BERHASIL',
      buktiUrl: params.buktiUrl
    };

    this.data.transactions.push(newTx);

    this.data.auditLogs.push({
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actor: params.penanggungJawab,
      role: 'BENDAHARA',
      action: 'INPUT_PENGELUARAN',
      detail: `Pengeluaran [${params.kategori}] sebesar Rp ${params.nominal.toLocaleString('id-ID')} untuk: ${params.keterangan}`
    });

    this.save();
    return newTx;
  }

  public getFinancialSummary(): FinancialSummary {
    let saldo = 0;
    let pemasukanBulanIni = 0;
    let pengeluaranBulanIni = 0;

    for (const t of this.data.transactions) {
      if (t.status === 'BERHASIL') {
        if (t.tipe === 'PEMASUKAN') {
          saldo += t.nominal;
          pemasukanBulanIni += t.nominal;
        } else {
          saldo -= t.nominal;
          pengeluaranBulanIni += t.nominal;
        }
      }
    }

    const totalWarga = this.data.residents.length;
    const totalWargaLunas = this.data.residents.filter(r => r.statusBulanIni === 'Lunas').length;
    const totalWargaBelumBayar = totalWarga - totalWargaLunas;
    const persentaseKepatuhan = totalWarga > 0 ? Math.round((totalWargaLunas / totalWarga) * 100) : 0;
    const targetKasBulanIni = this.data.residents.reduce((acc, r) => acc + r.tagihanBulanan, 0);
    const totalTunggakanWarga = this.data.residents.reduce((acc, r) => acc + r.totalTunggakan, 0);

    return {
      saldoKasSaatIni: saldo,
      totalPemasukanBulanIni: pemasukanBulanIni,
      totalPengeluaranBulanIni: pengeluaranBulanIni,
      totalWarga,
      totalWargaLunas,
      totalWargaBelumBayar,
      persentaseKepatuhan,
      targetKasBulanIni,
      totalTunggakanWarga
    };
  }

  public broadcastBillingReminder(residentId?: string): { count: number; notifications: WhatsAppNotification[] } {
    const targets = residentId
      ? this.data.residents.filter(r => r.id === residentId)
      : this.data.residents.filter(r => r.statusBulanIni !== 'Lunas');

    const createdNotifs: WhatsAppNotification[] = [];
    const dateStr = new Date().toISOString();

    for (const res of targets) {
      const cleanPhone = res.noWhatsapp.startsWith('0') ? '62' + res.noWhatsapp.slice(1) : res.noWhatsapp;
      const unpaidMonths = res.bulanMenunggak.length > 0 ? res.bulanMenunggak.join(', ') : 'November 2026';
      const amountDue = res.totalTunggakan > 0 ? res.totalTunggakan : res.tagihanBulanan;

      const msg = `📢 *PENGINGAT IURAN IPL PERUMAHAN SAUNG KEBUN*\n\n` +
        `Yth. *${res.nama}* (${res.blok})\n\n` +
        `Kami menginformasikan tagihan Iuran Pengelolaan Lingkungan (IPL) untuk periode *${unpaidMonths}* sebesar *Rp ${amountDue.toLocaleString('id-ID')}*.\n\n` +
        `Pembayaran dapat dilakukan dengan mudah secara digital melalui:\n` +
        `1. QRIS Nasional (Scan di Portal Warga)\n` +
        `2. Virtual Account BCA: 8809912040901\n` +
        `3. Transfer Bank / E-Wallet via Aplikasi IPL Saung Kebun\n\n` +
        `Partisipasi Anda sangat berarti untuk kelancaran operasional pos satpam 24 jam, kebersihan sampah, dan penerangan jalan lingkungan kita.\n\n` +
        `Terima kasih atas kerja samanya.\n_Pengurus Paguyuban Saung Kebun_\nKetua: Bp. Erlangga · Bendahara: Bp. Andriansyah`;

      const notif: WhatsAppNotification = {
        id: `notif-${Date.now()}-${res.id}`,
        timestamp: dateStr,
        targetPhone: res.noWhatsapp,
        targetName: res.nama,
        targetBlok: res.blok,
        type: 'TAGIHAN_BULANAN',
        message: msg,
        status: 'SENT',
        directLink: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      };

      this.data.notifications.push(notif);
      createdNotifs.push(notif);
    }

    this.save();
    return { count: targets.length, notifications: createdNotifs };
  }

  public resetDatabase(): void {
    this.data = initializeDatabase();
    this.save();
  }
}

export const db = new DatabaseManager();
