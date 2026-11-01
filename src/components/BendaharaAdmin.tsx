import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Send,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { Resident, Transaction } from '../types';
import { formatRupiah, sendBillingReminder, submitExpense } from '../lib/api';

interface BendaharaAdminProps {
  residents: Resident[];
  transactions: Transaction[];
  onOpenPayForResident: (resident: Resident) => void;
  onRefreshData: () => void;
}

export const BendaharaAdmin: React.FC<BendaharaAdminProps> = ({
  residents,
  transactions,
  onOpenPayForResident,
  onRefreshData
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  // Modal for new Expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseKategori, setExpenseKategori] = useState('Gaji Keamanan (Satpam)');
  const [expenseNominal, setExpenseNominal] = useState('');
  const [expenseKeterangan, setExpenseKeterangan] = useState('');
  const [expensePj, setExpensePj] = useState('Bp. Andriansyah (Bendahara)');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  // Filter residents
  const filteredResidents = residents.filter(r => {
    const matchesGroup = selectedGroup === 'ALL' || r.blokGroup === selectedGroup;
    const matchesStatus = selectedStatus === 'ALL' || r.statusBulanIni === selectedStatus;
    const matchesSearch =
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.noWhatsapp.includes(searchQuery);
    return matchesGroup && matchesStatus && matchesSearch;
  });

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

  const unpaidCount = residents.filter(r => r.statusBulanIni !== 'Lunas').length;

  const handleBroadcastReminder = async () => {
    if (!confirm(`Kirimkan pengingat WhatsApp ke ${unpaidCount} warga yang belum bayar iuran IPL?`)) return;
    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await sendBillingReminder();
      setBroadcastResult(`Berhasil menyiapkan ${res.count} pesan WhatsApp pengingat tagihan!`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pengingat');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSingleReminder = async (resident: Resident) => {
    try {
      const res = await sendBillingReminder(resident.id);
      if (res.notifications.length > 0) {
        window.open(res.notifications[0].directLink, '_blank');
      }
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesan');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseNominal || !expenseKeterangan) {
      alert('Harap isi nominal dan keterangan pengeluaran');
      return;
    }
    setExpenseSubmitting(true);
    try {
      await submitExpense({
        kategori: expenseKategori,
        nominal: Number(expenseNominal),
        keterangan: expenseKeterangan,
        penanggungJawab: expensePj
      });
      setShowExpenseModal(false);
      setExpenseNominal('');
      setExpenseKeterangan('');
      onRefreshData();
      alert('Pengeluaran berhasil dicatat ke buku kas!');
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pengeluaran');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const exportResidentsCSV = () => {
    const headers = ['Blok', 'Nama Warga', 'No WhatsApp', 'Tipe Rumah', 'Status Hunian', 'Tagihan Bulanan', 'Status Bulan Ini', 'Total Tunggakan'];
    const rows = residents.map(r => [
      r.blok,
      `"${r.nama}"`,
      r.noWhatsapp,
      r.tipeRumah,
      r.statusHunian,
      r.tagihanBulanan,
      r.statusBulanIni,
      r.totalTunggakan
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_ipl_saung_kebun_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Dashboard Pengurus & Bendahara Kas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
              ADMIN KEUANGAN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data 115 unit rumah, input pengeluaran operasional, verifikasi setoran, dan kirim pengingat WhatsApp otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Pengeluaran Kas</span>
          </button>

          <button
            onClick={handleBroadcastReminder}
            disabled={isBroadcasting || unpaidCount === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>{isBroadcasting ? 'Mengirim...' : `Broadcast Pengingat WA (${unpaidCount})`}</span>
          </button>

          <button
            onClick={exportResidentsCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {broadcastResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{broadcastResult}</span>
          <button onClick={() => setBroadcastResult(null)} className="font-bold underline ml-2">Tutup</button>
        </div>
      )}

      {/* Resident Database Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Seluruh Unit Warga ({filteredResidents.length} dari {residents.length} Rumah)
            </h3>
            <p className="text-xs text-slate-500">
              Setiap warga terdaftar dapat mengakses akun masing-masing secara bersamaan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Blok Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {availableGroups.map(grp => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGroup === grp
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {grp === 'ALL' ? 'Semua' : grp === 'B8-Ext' ? 'Cadangan' : `Blok ${grp}`}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Menunggak">Menunggak</option>
            </select>

            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama / blok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 z-10">
              <tr>
                <th className="py-3 px-4">Blok</th>
                <th className="py-3 px-4">Nama Kepala Keluarga</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Tipe & Hunian</th>
                <th className="py-3 px-4 text-right">Tarif IPL</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Tindakan Pengurus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredResidents.map(res => {
                const isLunas = res.statusBulanIni === 'Lunas';
                return (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {res.blok}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                      {res.statusHunian === 'Rumah Kosong' || res.nama.includes('Belum Tercatat') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-dashed border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>(Belum Tercatat / Kosong)</span>
                        </span>
                      ) : (
                        <span>{res.nama}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {res.noWhatsapp === '-' ? (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      ) : (
                        <span>{res.noWhatsapp}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      <span>{res.tipeRumah}</span> · <span>{res.statusHunian}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                      {formatRupiah(res.tagihanBulanan)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isLunas ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>LUNAS</span>
                        </span>
                      ) : res.statusBulanIni === 'Menunggak' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>MENUNGGAK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>BELUM BAYAR</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      {!isLunas ? (
                        <>
                          <button
                            onClick={() => onOpenPayForResident(res)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition-colors"
                          >
                            Catat Bayar
                          </button>
                          <button
                            onClick={() => handleSingleReminder(res)}
                            title="Kirim Pesan WhatsApp"
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded font-medium text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WA</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          ✓ Lunas {res.lastPaymentDate ? `(${res.lastPaymentDate.slice(-2)} Okt)` : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredResidents.length} dari {residents.length} unit rumah</span>
          <span>Perumahan Saung Kebun · Transparansi Akurat</span>
        </div>
      </div>

      {/* Modal Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Catat Pengeluaran Kas Baru</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Pengeluaran</label>
                <select
                  value={expenseKategori}
                  onChange={(e) => setExpenseKategori(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Gaji Keamanan (Satpam)">Gaji Keamanan (Satpam 2 Orang)</option>
                  <option value="Retribusi Kebersihan & Sampah">Retribusi Truk Sampah & Kebersihan</option>
                  <option value="Listrik Fasum & PJU">Listrik PLN Fasum & Lampu Jalan</option>
                  <option value="Perawatan Sarana & Fogging">Perawatan Fasilitas & Fogging Nyamuk</option>
                  <option value="Pemeliharaan Taman & CCTV">Pemeliharaan Taman & CCTV</option>
                  <option value="Santunan Sosial & Duka">Santunan Sosial & Duka Cita</option>
                  <option value="Operasional & ATK">Operasional & ATK Paguyuban</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal (Rupiah)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={expenseNominal}
                  onChange={(e) => setExpenseNominal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Uraian Belanja</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pembelian 4 lampu LED PJU jalan Blok C & bensin genset pos"
                  value={expenseKeterangan}
                  onChange={(e) => setExpenseKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab</label>
                <input
                  type="text"
                  value={expensePj}
                  onChange={(e) => setExpensePj(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {expenseSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
