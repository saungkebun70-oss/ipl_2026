import React, { useState, useMemo } from 'react';
import {
  Search,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ExternalLink,
  ArrowRight,
  Download,
  Filter,
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Resident } from '../types';
import { formatRupiah, formatDateIndo } from '../lib/api';

interface ResidentDirectoryProps {
  residents: Resident[];
  onSelectResident: (resident: Resident) => void;
  onPayForResident: (resident: Resident) => void;
}

export const ResidentDirectory: React.FC<ResidentDirectoryProps> = ({
  residents,
  onSelectResident,
  onPayForResident
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTipe, setSelectedTipe] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [sortField, setSortField] = useState<'blok' | 'nama' | 'tagihanBulanan' | 'statusBulanIni'>('blok');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Dynamic available block groups from actual resident roster
  const availableGroups = useMemo(() => {
    const list = ['ALL'];
    const preferredOrder = ['B3', 'B5', 'B6', 'B7', 'B8', 'B8-Ext'];
    preferredOrder.forEach(grp => {
      if (residents.some(r => r.blokGroup === grp)) {
        list.push(grp);
      }
    });
    // Append any other block groups
    residents.forEach(r => {
      if (r.blokGroup && !list.includes(r.blokGroup)) {
        list.push(r.blokGroup);
      }
    });
    return list;
  }, [residents]);

  const getGroupLabel = (grp: string) => {
    if (grp === 'ALL') return 'Semua Blok';
    if (grp === 'B8-Ext') return 'Kavling Cadangan';
    return `Blok ${grp}`;
  };

  // Filter & Search Logic
  const filtered = useMemo(() => {
    return residents.filter(r => {
      const matchesGroup = selectedGroup === 'ALL' || r.blokGroup === selectedGroup;
      const matchesStatus = selectedStatus === 'ALL' || r.statusBulanIni === selectedStatus;
      const matchesTipe = selectedTipe === 'ALL' || r.tipeRumah === selectedTipe;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.nama.toLowerCase().includes(q) ||
        r.blok.toLowerCase().includes(q) ||
        r.nomorRumah.toLowerCase().includes(q) ||
        r.noWhatsapp.includes(q);
      return matchesGroup && matchesStatus && matchesTipe && matchesSearch;
    });
  }, [residents, selectedGroup, selectedStatus, selectedTipe, searchQuery]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comp = 0;
      if (sortField === 'blok') comp = a.blok.localeCompare(b.blok, undefined, { numeric: true });
      else if (sortField === 'nama') comp = a.nama.localeCompare(b.nama);
      else if (sortField === 'tagihanBulanan') comp = a.tagihanBulanan - b.tagihanBulanan;
      else if (sortField === 'statusBulanIni') comp = a.statusBulanIni.localeCompare(b.statusBulanIni);
      return sortAsc ? comp : -comp;
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = pageSize === 0 ? 1 : Math.ceil(sorted.length / pageSize);
  const paginatedResidents = useMemo(() => {
    if (pageSize === 0) return sorted;
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Statistics
  const totalLunas = residents.filter(r => r.statusBulanIni === 'Lunas').length;
  const totalBelumBayar = residents.filter(r => r.statusBulanIni !== 'Lunas').length;
  const complianceRate = Math.round((totalLunas / (residents.length || 1)) * 100);

  const handleSort = (field: 'blok' | 'nama' | 'tagihanBulanan' | 'statusBulanIni') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Blok / Unit',
      'Nama Warga',
      'No WhatsApp',
      'Tipe Rumah',
      'Status Hunian',
      'Tarif Bulanan',
      'Status Bulan Ini',
      'Tunggakan (Rp)',
      'Terakhir Bayar'
    ];

    const rows = sorted.map((r, idx) => [
      idx + 1,
      `"${r.blok}"`,
      `"${r.nama}"`,
      `"${r.noWhatsapp}"`,
      `"${r.tipeRumah}"`,
      `"${r.statusHunian}"`,
      r.tagihanBulanan,
      `"${r.statusBulanIni}"`,
      r.totalTunggakan || 0,
      `"${r.lastPaymentDate ? r.lastPaymentDate.slice(0, 10) : '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_warga_saung_kebun_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================= */}
      {/* 1. HEADER PANEL & AGGREGATE SUMMARY STATS                 */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Tabel Data Warga Saung Kebun
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold font-mono border border-emerald-200">
              115 UNIT RESMI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Data terdaftar seluruh kepala keluarga dan unit rumah perumahan Saung Kebun. Klik "Buka Akun" untuk melihat E-Card digital dan riwayat setoran personal masing-masing unit.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Total Warga</span>
            <span className="font-extrabold text-slate-900 text-sm block font-mono">115 Unit</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-[10px] text-emerald-700 block uppercase font-mono">Lunas ({complianceRate}%)</span>
            <span className="font-extrabold text-emerald-900 text-sm block font-mono">{totalLunas} Unit</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
            <span className="text-[10px] text-rose-700 block uppercase font-mono">Belum Bayar</span>
            <span className="font-extrabold text-rose-900 text-sm block font-mono">{totalBelumBayar} Unit</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-1"
            title="Download CSV Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FILTER, PENCARIAN & KONTROL TAMPILAN                   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Blok Buttons Navigation */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {availableGroups.map(grp => {
              const count = grp === 'ALL' ? residents.length : residents.filter(r => r.blokGroup === grp).length;
              const isSelected = selectedGroup === grp;
              return (
                <button
                  key={grp}
                  onClick={() => {
                    setSelectedGroup(grp);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{getGroupLabel(grp)}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Info text */}
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            Menampilkan <strong className="text-slate-800">{filtered.length}</strong> dari {residents.length} Unit
          </span>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Status Iuran</option>
              <option value="Lunas">Status: Lunas</option>
              <option value="Belum Bayar">Status: Belum Bayar</option>
              <option value="Menunggak">Status: Menunggak</option>
            </select>

            {/* Tipe Rumah Filter */}
            <select
              value={selectedTipe}
              onChange={(e) => {
                setSelectedTipe(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Tipe Rumah</option>
              <option value="Standar">Tipe Standar (Rp 150rb)</option>
              <option value="Hook">Tipe Hook (Rp 175rb)</option>
            </select>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="15">Tampilkan: 15 Data</option>
              <option value="30">Tampilkan: 30 Data</option>
              <option value="50">Tampilkan: 50 Data</option>
              <option value="0">Tampilkan: Semua (115)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, blok (misal: B05/21), WA..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABEL DATA WARGA LENGKAP & RESPONSIVE                  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('blok')}
                  className="py-3.5 px-4 font-mono cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Blok / Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nama')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Kepala Keluarga</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Tipe & Hunian</th>
                <th
                  onClick={() => handleSort('tagihanBulanan')}
                  className="py-3.5 px-4 font-mono cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tarif IPL</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('statusBulanIni')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status Bulan Ini</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Keterangan / Terakhir Bayar</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedResidents.map((res, index) => {
                const isLunas = res.statusBulanIni === 'Lunas';
                const isMenunggak = res.statusBulanIni === 'Menunggak';

                return (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* 1. Blok / Unit */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-8 rounded-xl bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shadow-2xs group-hover:bg-emerald-700 transition-colors">
                          {res.blok}
                        </span>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">
                            Blok {res.blokGroup} · No {res.nomorRumah}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Nama Kepala Keluarga & Hunian */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{res.nama}</span>
                        {res.blok === 'B03/07' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-blue-800">
                            KETUA
                          </span>
                        )}
                        {res.blok === 'B07/16' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                            BENDAHARA
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {res.statusHunian}
                      </span>
                    </td>

                    {/* 3. Kontak WhatsApp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <a
                        href={`https://api.whatsapp.com/send?phone=62${res.noWhatsapp.replace(/^0|\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{res.noWhatsapp}</span>
                      </a>
                    </td>

                    {/* 4. Tipe Unit */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        res.tipeRumah === 'Hook'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        Tipe {res.tipeRumah}
                      </span>
                    </td>

                    {/* 5. Tarif IPL */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(res.tagihanBulanan)}
                    </td>

                    {/* 6. Status Bulan Ini */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isLunas ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>LUNAS</span>
                        </span>
                      ) : isMenunggak ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>MENUNGGAK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>BELUM BAYAR</span>
                        </span>
                      )}
                    </td>

                    {/* 7. Keterangan / Terakhir Bayar */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {isLunas && res.lastPaymentDate ? (
                        <span className="text-emerald-700 font-mono">
                          Lunas tgl {res.lastPaymentDate.slice(0, 10)}
                        </span>
                      ) : res.bulanMenunggak && res.bulanMenunggak.length > 0 ? (
                        <span className="text-rose-600 font-medium">
                          Periode: {res.bulanMenunggak.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400">Jatuh tempo 10 Nov 2026</span>
                      )}
                    </td>

                    {/* 8. Aksi */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectResident(res)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Buka Akun Warga & Lihat E-Card Digital"
                        >
                          <span>Buka Akun</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {!isLunas && (
                          <button
                            onClick={() => onPayForResident(res)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Bayar Iuran via QRIS / Virtual Account"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Bayar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sorted.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">Tidak ada data warga yang sesuai.</p>
            <p className="mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter blok di atas.</p>
          </div>
        )}

        {/* Table Footer with Summary Aggregation & Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan data <strong>{sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> - <strong>{Math.min(currentPage * (pageSize || sorted.length), sorted.length)}</strong> dari <strong>{sorted.length}</strong> warga
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-slate-700 font-bold px-2">
                Hal {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentDirectory;
