import { Resident, MonthKey, MonthlyLedgerItem, MonthPaymentStatus } from '../types/index';

export interface RawResidentRow {
  blok: string;
  no: number;
  nama: string;
  months?: Partial<Record<MonthKey, MonthPaymentStatus>>;
}

export const MONTH_KEYS: MonthKey[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

export const MONTH_LABELS: Record<MonthKey, string> = {
  Jan: 'Januari 2026',
  Feb: 'Februari 2026',
  Mar: 'Maret 2026',
  Apr: 'April 2026',
  Mei: 'Mei 2026',
  Jun: 'Juni 2026',
  Jul: 'Juli 2026',
  Agt: 'Agustus 2026',
  Sep: 'September 2026',
  Okt: 'Oktober 2026',
  Nov: 'November 2026',
  Des: 'Desember 2026'
};

// Data mentah sensus & matriks setoran IPL perumahan Saung Kebun
// Aturan:
// - Tarif Iuran: Rp 100.000 / bulan
// - Merah dan putih tanpa nilai = KOSONG
// - Kuning = MENUNGGAK
// - 100.000 = LUNAS
export const RAW_ROSTER_DATA: RawResidentRow[] = [
  // ==========================================
  // 1. BLOK B3 (1 s/d 23)
  // ==========================================
  {
    blok: 'B3', no: 1, nama: 'ASEP SUKARMA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 2, nama: 'SUBHAN HUMAMI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B3', no: 3, nama: '' }, // Merah KOSONG
  {
    blok: 'B3', no: 4, nama: 'ADITYA PRAYOGA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B3', no: 5, nama: '' }, // Merah KOSONG
  {
    blok: 'B3', no: 6, nama: 'AFAN',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 7, nama: 'DION YULIANA (BP ERLANGGA - KETUA)',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 8, nama: 'RAKA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B3', no: 9, nama: '' }, // Merah KOSONG
  {
    blok: 'B3', no: 10, nama: 'DEVA CAHYONO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS' }
  },
  { blok: 'B3', no: 11, nama: '' }, // Merah KOSONG
  {
    blok: 'B3', no: 12, nama: 'PUGUH DWI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B3', no: 13, nama: '' }, // Merah KOSONG
  {
    blok: 'B3', no: 14, nama: 'ARDI MAULANA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 15, nama: 'WENDY ROCHIMAT S',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'MENUNGGAK', Jul: 'MENUNGGAK', Agt: 'MENUNGGAK', Sep: 'MENUNGGAK' }
  },
  {
    blok: 'B3', no: 16, nama: 'TRI SEPTIONO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'MENUNGGAK', Sep: 'MENUNGGAK' }
  },
  { blok: 'B3', no: 17, nama: '' }, // Merah KOSONG
  {
    blok: 'B3', no: 18, nama: 'CASMAT',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 19, nama: 'SARMA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 20, nama: 'ARDIANSYAH ZEIN',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 21, nama: 'CECEP SUGIANTO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'MENUNGGAK' }
  },
  {
    blok: 'B3', no: 22, nama: 'DICKY YANDA ALVIANA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B3', no: 23, nama: 'FAISAL',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },

  // ==========================================
  // 2. BLOK B5 (1 s/d 26)
  // ==========================================
  { blok: 'B5', no: 1, nama: '' },
  { blok: 'B5', no: 2, nama: '' },
  { blok: 'B5', no: 3, nama: '' },
  { blok: 'B5', no: 4, nama: '' },
  { blok: 'B5', no: 5, nama: '' },
  { blok: 'B5', no: 6, nama: '' },
  { blok: 'B5', no: 7, nama: '' },
  { blok: 'B5', no: 8, nama: '' },
  { blok: 'B5', no: 9, nama: '' },
  { blok: 'B5', no: 10, nama: '' },
  { blok: 'B5', no: 11, nama: '' },
  { blok: 'B5', no: 12, nama: '' },
  { blok: 'B5', no: 13, nama: '' },
  { blok: 'B5', no: 14, nama: '' },
  { blok: 'B5', no: 15, nama: '' },
  { blok: 'B5', no: 16, nama: '' },
  { blok: 'B5', no: 17, nama: '' },
  { blok: 'B5', no: 18, nama: 'DARMA' },
  { blok: 'B5', no: 19, nama: '' },
  { blok: 'B5', no: 20, nama: 'DWI ARDIYANTO' },
  { blok: 'B5', no: 21, nama: 'HARTONO (BP DONI - HUMAS)' },
  { blok: 'B5', no: 22, nama: 'TOMA' },
  { blok: 'B5', no: 23, nama: 'ADITYA' },
  { blok: 'B5', no: 24, nama: 'DEDI WAHYUDI (BP WAHYU - HUMAS)' },
  { blok: 'B5', no: 25, nama: 'SIGIT' },
  { blok: 'B5', no: 26, nama: '' },

  // ==========================================
  // 3. BLOK B6 (1 s/d 23)
  // ==========================================
  { blok: 'B6', no: 1, nama: 'IKBAL' }, // Merah di sheet
  {
    blok: 'B6', no: 2, nama: 'DEFRY',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'MENUNGGAK' }
  },
  {
    blok: 'B6', no: 3, nama: 'BUDYANTO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 4, nama: 'RIDWAN',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS' }
  },
  {
    blok: 'B6', no: 5, nama: 'ABIDZAR',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 6, nama: 'ANGKASA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 7, nama: 'NOVI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'MENUNGGAK', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 8, nama: 'M JODI RAMADHAN',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 9, nama: 'HASMI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 10, nama: 'AJE',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'MENUNGGAK', Agt: 'MENUNGGAK', Sep: 'MENUNGGAK' }
  },
  {
    blok: 'B6', no: 11, nama: 'JODI KURNIAWAN',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 12, nama: 'RULLY',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B6', no: 13, nama: '' },
  {
    blok: 'B6', no: 14, nama: 'ADE JAHIDI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B6', no: 15, nama: '' },
  {
    blok: 'B6', no: 16, nama: 'WIDODO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B6', no: 17, nama: '' },
  {
    blok: 'B6', no: 18, nama: 'SUTRISMAN',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B6', no: 19, nama: 'MUHAMMAD SIDIK',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'MENUNGGAK' }
  },
  { blok: 'B6', no: 20, nama: '' },
  {
    blok: 'B6', no: 21, nama: 'CHOLIL',
    months: { Feb: 'LUNAS', Mar: 'MENUNGGAK', Apr: 'LUNAS', Mei: 'MENUNGGAK', Jun: 'MENUNGGAK', Jul: 'MENUNGGAK', Agt: 'LUNAS', Sep: 'MENUNGGAK' }
  },
  { blok: 'B6', no: 22, nama: '' },
  {
    blok: 'B6', no: 23, nama: 'MULYONO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },

  // ==========================================
  // 4. BLOK B7 (1 s/d 23)
  // ==========================================
  { blok: 'B7', no: 1, nama: '' },
  { blok: 'B7', no: 2, nama: 'NOVAL' },
  {
    blok: 'B7', no: 3, nama: 'DEDE NURHIDAYAT',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 4, nama: 'DEVI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'MENUNGGAK', Mei: 'MENUNGGAK', Jun: 'MENUNGGAK', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B7', no: 5, nama: '' },
  {
    blok: 'B7', no: 6, nama: 'ANDRI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 7, nama: 'BAGAS A',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 8, nama: 'CECEP',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B7', no: 9, nama: '' },
  {
    blok: 'B7', no: 10, nama: 'AKBAR',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 11, nama: 'YUKI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 12, nama: 'ARGA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B7', no: 13, nama: '' },
  {
    blok: 'B7', no: 14, nama: 'ABDU NAFI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B7', no: 15, nama: '' },
  {
    blok: 'B7', no: 16, nama: 'ANDRIANSYAH (BENDAHARA KAS)',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 17, nama: 'MUTIARA',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 18, nama: 'MUHAMMAD DAUD SYAH',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'MENUNGGAK', Jul: 'MENUNGGAK', Agt: 'MENUNGGAK', Sep: 'MENUNGGAK' }
  },
  {
    blok: 'B7', no: 19, nama: 'SAMSURI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 20, nama: 'RISKY ALVIN NOVIANTO',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B7', no: 21, nama: 'RIZKI NURMANSYAH',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B7', no: 22, nama: '' },
  {
    blok: 'B7', no: 23, nama: 'SUGIH',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },

  // ==========================================
  // 5. BLOK B8 (1 s/d 23)
  // ==========================================
  {
    blok: 'B8', no: 1, nama: 'CANDRA ARIS SANDI',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B8', no: 2, nama: '' },
  {
    blok: 'B8', no: 3, nama: 'DICKY',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B8', no: 4, nama: '' },
  {
    blok: 'B8', no: 5, nama: 'IWAN (BP PEMBINA PAGUYUBAN)',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B8', no: 6, nama: 'DENY (SEKSI OLAHRAGA)',
    months: { Feb: 'LUNAS', Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B8', no: 7, nama: 'ANI FATIMAH',
    months: { Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  {
    blok: 'B8', no: 8, nama: 'BINTANG',
    months: { Mar: 'LUNAS', Apr: 'LUNAS', Mei: 'LUNAS', Jun: 'LUNAS', Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS' }
  },
  { blok: 'B8', no: 9, nama: '' },
  { blok: 'B8', no: 10, nama: '' },
  {
    blok: 'B8', no: 11, nama: 'PA HUSNI',
    months: { Jul: 'LUNAS', Agt: 'LUNAS', Sep: 'LUNAS', Okt: 'LUNAS', Nov: 'LUNAS' }
  },
  { blok: 'B8', no: 12, nama: '' },
  { blok: 'B8', no: 13, nama: '' },
  { blok: 'B8', no: 14, nama: '' },
  { blok: 'B8', no: 15, nama: '' },
  { blok: 'B8', no: 16, nama: '' },
  { blok: 'B8', no: 17, nama: '' },
  { blok: 'B8', no: 18, nama: '' },
  { blok: 'B8', no: 19, nama: '' },
  { blok: 'B8', no: 20, nama: '' },
  { blok: 'B8', no: 21, nama: '' },
  { blok: 'B8', no: 22, nama: '' },
  { blok: 'B8', no: 23, nama: '' },

  // ==========================================
  // 6. BLOK B8-Ext (Kavling Tambahan 1 s/d 23)
  // ==========================================
  { blok: 'B8-Ext', no: 1, nama: '' },
  { blok: 'B8-Ext', no: 2, nama: '' },
  { blok: 'B8-Ext', no: 3, nama: '' },
  { blok: 'B8-Ext', no: 4, nama: '' },
  { blok: 'B8-Ext', no: 5, nama: '' },
  { blok: 'B8-Ext', no: 6, nama: '' },
  { blok: 'B8-Ext', no: 7, nama: '' },
  { blok: 'B8-Ext', no: 8, nama: '' },
  { blok: 'B8-Ext', no: 9, nama: '' },
  { blok: 'B8-Ext', no: 10, nama: '' },
  { blok: 'B8-Ext', no: 11, nama: '' },
  { blok: 'B8-Ext', no: 12, nama: '' },
  { blok: 'B8-Ext', no: 13, nama: '' },
  { blok: 'B8-Ext', no: 14, nama: '' },
  { blok: 'B8-Ext', no: 15, nama: '' },
  { blok: 'B8-Ext', no: 16, nama: '' },
  { blok: 'B8-Ext', no: 17, nama: '' },
  { blok: 'B8-Ext', no: 18, nama: '' },
  { blok: 'B8-Ext', no: 19, nama: '' },
  { blok: 'B8-Ext', no: 20, nama: '' },
  { blok: 'B8-Ext', no: 21, nama: '' },
  { blok: 'B8-Ext', no: 22, nama: '' },
  { blok: 'B8-Ext', no: 23, nama: '' }
];

export const IPL_TARIFF = 100000;

export function buildResidentsFromRoster(): Resident[] {
  return RAW_ROSTER_DATA.map((row) => {
    const numPadded = row.no.toString().padStart(2, '0');
    const blokFormatted = `${row.blok.replace('B8-Ext', 'B8X')}/${numPadded}`;
    const hasName = Boolean(row.nama && row.nama.trim() !== '');

    // Phone number generator logic
    let phone = '0812' + (10000000 + (row.no * 37 + row.blok.charCodeAt(1) * 117) % 89999999).toString();
    if (row.nama.includes('KETUA') || row.nama.includes('ERLANGGA')) phone = '081298765432';
    if (row.nama.includes('BENDAHARA')) phone = '081287654321';
    if (row.nama.includes('IWAN')) phone = '081289550805';
    if (row.nama.includes('DONI')) phone = '081234567821';
    if (row.nama.includes('WAHYU')) phone = '081234567824';
    if (row.nama.includes('DENI')) phone = '081234567806';

    const isHook = [1, 23, 26].includes(row.no);

    // Ledger initialization
    const monthlyLedger: Record<MonthKey, MonthlyLedgerItem> = {
      Jan: { status: 'KOSONG', amount: 0, note: 'Iuran mulai Feb' },
      Feb: { status: 'KOSONG', amount: 0 },
      Mar: { status: 'KOSONG', amount: 0 },
      Apr: { status: 'KOSONG', amount: 0 },
      Mei: { status: 'KOSONG', amount: 0 },
      Jun: { status: 'KOSONG', amount: 0 },
      Jul: { status: 'KOSONG', amount: 0 },
      Agt: { status: 'KOSONG', amount: 0 },
      Sep: { status: 'KOSONG', amount: 0 },
      Okt: { status: 'KOSONG', amount: 0 },
      Nov: { status: 'KOSONG', amount: 0 },
      Des: { status: 'KOSONG', amount: 0 }
    };

    let totalSetoran = 0;
    const bulanMenunggakList: string[] = [];

    if (row.months) {
      MONTH_KEYS.forEach((mKey) => {
        if (mKey === 'Jan') {
          // Aturan: Jan selalu (-) karena mulai setor di bulan Feb
          monthlyLedger.Jan = { status: 'KOSONG', amount: 0, note: 'Mulai setor Februari' };
          return;
        }

        const rawStatus = row.months ? row.months[mKey] : undefined;
        if (rawStatus === 'LUNAS') {
          monthlyLedger[mKey] = {
            status: 'LUNAS',
            amount: IPL_TARIFF,
            paidDate: '2026-09-05'
          };
          totalSetoran += IPL_TARIFF;
        } else if (rawStatus === 'MENUNGGAK') {
          monthlyLedger[mKey] = {
            status: 'MENUNGGAK',
            amount: IPL_TARIFF
          };
          bulanMenunggakList.push(MONTH_LABELS[mKey]);
        } else if (rawStatus === 'KOSONG') {
          monthlyLedger[mKey] = { status: 'KOSONG', amount: 0 };
        } else {
          const idx = MONTH_KEYS.indexOf(mKey);
          if (idx <= 8) { // Jan - Sep
            monthlyLedger[mKey] = { status: 'KOSONG', amount: 0 };
          } else {
            monthlyLedger[mKey] = { status: 'BELUM_BAYAR', amount: 0 };
          }
        }
      });
    } else {
      MONTH_KEYS.forEach(mKey => {
        monthlyLedger[mKey] = { status: 'KOSONG', amount: 0 };
      });
    }

    const totalTunggakan = bulanMenunggakList.length * IPL_TARIFF;

    let statusBulanIni: 'Lunas' | 'Belum Bayar' | 'Menunggak' = 'Belum Bayar';
    if (monthlyLedger.Sep.status === 'LUNAS') {
      statusBulanIni = 'Lunas';
    } else if (monthlyLedger.Sep.status === 'MENUNGGAK' || totalTunggakan > 0) {
      statusBulanIni = 'Menunggak';
    } else if (hasName) {
      statusBulanIni = 'Belum Bayar';
    } else {
      statusBulanIni = 'Belum Bayar';
    }

    const isOccupied = hasName && (totalSetoran > 0 || bulanMenunggakList.length > 0 || ['B05/21', 'B05/24'].includes(blokFormatted));

    return {
      id: `res-${row.blok.toLowerCase()}-${numPadded}`,
      blok: blokFormatted,
      blokGroup: row.blok,
      nomorRumah: numPadded,
      nama: hasName ? row.nama : '(Belum Tercatat / Kosong)',
      noWhatsapp: phone,
      statusHunian: isOccupied ? 'Dihuni Tetap' : 'Rumah Kosong',
      tipeRumah: isHook ? 'Hook' : 'Standar',
      tagihanBulanan: IPL_TARIFF,
      statusBulanIni,
      bulanMenunggak: bulanMenunggakList,
      totalTunggakan,
      lastPaymentDate: totalSetoran > 0 ? '2026-09-05' : undefined,
      pin: '1234',
      monthlyLedger,
      totalSetoran
    };
  });
}
