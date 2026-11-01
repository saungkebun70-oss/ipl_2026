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
  Check,
  Edit3,
  UserPlus,
  HelpCircle,
  Printer,
  Sparkles,
  Info,
  X,
  Save,
  MessageCircle,
  Table as TableIcon,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Trash2,
  Plus
} from 'lucide-react';
import { Resident, MonthKey, MonthPaymentStatus } from '../types';
import { formatRupiah, formatDateIndo, updateResident, updateResidentMonthStatus, addResident, deleteResident } from '../lib/api';

interface DatabaseWargaProps {
  residents: Resident[];
  onSelectResident: (resident: Resident) => void;
  onPayForResident: (resident: Resident) => void;
  onResidentUpdated?: () => void;
}

const MONTH_KEYS: MonthKey[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_NAMES: Record<MonthKey, string> = {
  Jan: 'Januari',
  Feb: 'Februari',
  Mar: 'Maret',
  Apr: 'April',
  Mei: 'Mei',
  Jun: 'Juni',
  Jul: 'Juli',
  Agt: 'Agustus',
  Sep: 'September',
  Okt: 'Oktober',
  Nov: 'November',
  Des: 'Desember'
};

export const DatabaseWarga: React.FC<DatabaseWargaProps> = ({
  residents,
  onSelectResident,
  onPayForResident,
  onResidentUpdated
}) => {
  // Main view tab: 'MATRIX' (Spreadsheet view) or 'TABLE' (Directory list)
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'TABLE'>('MATRIX');

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('ALL'); // 'ALL' | 'OCCUPIED' | 'VACANT'
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL' | 'Lunas' | 'Belum Bayar' | 'Menunggak'
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Sorting for Table View
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [sortField, setSortField] = useState<'nomor' | 'blok' | 'nama' | 'statusBulanIni' | 'totalSetoran'>('nomor');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Edit resident profile modal
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [editFormData, setEditFormData] = useState({
    nama: '',
    noWhatsapp: '',
    statusHunian: 'Dihuni Tetap' as 'Dihuni Tetap' | 'Disewa/Kontrak' | 'Rumah Kosong',
    tipeRumah: 'Standar' as 'Standar' | 'Hook',
    tagihanBulanan: 100000,
    pin: '1234'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Add Resident Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'FILL_VACANT' | 'NEW_LOT'>('FILL_VACANT');
  const [selectedVacantLotId, setSelectedVacantLotId] = useState<string>('');
  const [addFormData, setAddFormData] = useState({
    blokGroup: 'B3',
    nomorRumah: '',
    nama: '',
    noWhatsapp: '',
    statusHunian: 'Dihuni Tetap' as 'Dihuni Tetap' | 'Disewa/Kontrak' | 'Rumah Kosong',
    tipeRumah: 'Standar' as 'Standar' | 'Hook',
    tagihanBulanan: 100000,
    pin: '1234'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // Delete Resident Confirmation State
  const [deleteConfirmResident, setDeleteConfirmResident] = useState<Resident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Cell Status Editor Modal (when clicking a month cell in matrix)
  const [cellEditModal, setCellEditModal] = useState<{
    resident: Resident;
    month: MonthKey;
    currentStatus: MonthPaymentStatus;
    currentAmount: number;
  } | null>(null);
  const [isUpdatingCell, setIsUpdatingCell] = useState(false);

  // Helper check if resident is empty / belum tercatat
  const isResidentEmpty = (r: Resident) => {
    return (
      r.statusHunian === 'Rumah Kosong' ||
      r.nama.includes('Belum Tercatat') ||
      r.nama.trim() === '' ||
      r.nama === '-'
    );
  };

  // List of all currently vacant lots
  const vacantResidents = useMemo(() => {
    return residents.filter(isResidentEmpty).sort((a, b) => {
      if (a.blokGroup !== b.blokGroup) return a.blokGroup.localeCompare(b.blokGroup);
      return (parseInt(a.nomorRumah) || 0) - (parseInt(b.nomorRumah) || 0);
    });
  }, [residents]);

  // Dynamic available block groups from actual resident roster
  const availableGroups = useMemo(() => {
    const list = ['ALL'];
    const preferredOrder = ['B3', 'B5', 'B6', 'B7', 'B8', 'B8-Ext'];
    preferredOrder.forEach(grp => {
      if (residents.some(r => r.blokGroup === grp)) {
        list.push(grp);
      }
    });
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
  const filteredResidents = useMemo(() => {
    return residents.filter(r => {
      const matchesGroup = selectedGroup === 'ALL' || r.blokGroup === selectedGroup;
      
      const empty = isResidentEmpty(r);
      let matchesOccupancy = true;
      if (selectedOccupancy === 'OCCUPIED') {
        matchesOccupancy = !empty;
      } else if (selectedOccupancy === 'VACANT') {
        matchesOccupancy = empty;
      }

      let matchesStatus = true;
      if (selectedStatus !== 'ALL') {
        matchesStatus = r.statusBulanIni === selectedStatus;
      }

      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          r.blok.toLowerCase().includes(q) ||
          r.nama.toLowerCase().includes(q) ||
          r.nomorRumah.includes(q) ||
          r.noWhatsapp.includes(q);
      }

      return matchesGroup && matchesOccupancy && matchesStatus && matchesSearch;
    });
  }, [residents, selectedGroup, selectedOccupancy, selectedStatus, searchQuery]);

  // Sorting
  const sortedResidents = useMemo(() => {
    return [...filteredResidents].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'nomor') {
        comparison = (parseInt(a.nomorRumah) || 0) - (parseInt(b.nomorRumah) || 0);
      } else if (sortField === 'blok') {
        comparison = a.blok.localeCompare(b.blok);
      } else if (sortField === 'nama') {
        comparison = a.nama.localeCompare(b.nama);
      } else if (sortField === 'statusBulanIni') {
        comparison = a.statusBulanIni.localeCompare(b.statusBulanIni);
      } else if (sortField === 'totalSetoran') {
        comparison = (a.totalSetoran || 0) - (b.totalSetoran || 0);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredResidents, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedResidents.length / pageSize) || 1;
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedResidents.slice(start, start + pageSize);
  }, [sortedResidents, currentPage, pageSize]);

  // Overall Financial Statistics from the matrix
  const matrixStats = useMemo(() => {
    let grandTotalPaid = 0;
    let grandTotalMenunggak = 0;
    let occupiedCount = 0;
    let vacantCount = 0;

    // Monthly totals across filtered residents
    const monthlySums: Record<MonthKey, { totalPaid: number; countPaid: number; countMenunggak: number }> = {
      Jan: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Feb: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Mar: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Apr: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Mei: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Jun: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Jul: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Agt: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Sep: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Okt: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Nov: { totalPaid: 0, countPaid: 0, countMenunggak: 0 },
      Des: { totalPaid: 0, countPaid: 0, countMenunggak: 0 }
    };

    residents.forEach(r => {
      if (isResidentEmpty(r)) {
        vacantCount++;
      } else {
        occupiedCount++;
      }

      if (r.totalSetoran) grandTotalPaid += r.totalSetoran;
      if (r.totalTunggakan) grandTotalMenunggak += r.totalTunggakan;

      if (r.monthlyLedger) {
        MONTH_KEYS.forEach(m => {
          const item = r.monthlyLedger?.[m];
          if (item?.status === 'LUNAS') {
            monthlySums[m].totalPaid += (item.amount || 100000);
            monthlySums[m].countPaid++;
          } else if (item?.status === 'MENUNGGAK') {
            monthlySums[m].countMenunggak++;
          }
        });
      }
    });

    return {
      grandTotalPaid,
      grandTotalMenunggak,
      occupiedCount,
      vacantCount,
      monthlySums
    };
  }, [residents]);

  // Open Edit Profile Modal
  const handleOpenEdit = (res: Resident) => {
    setEditingResident(res);
    setEditFormData({
      nama: isResidentEmpty(res) ? '' : res.nama,
      noWhatsapp: res.noWhatsapp === '-' ? '' : res.noWhatsapp,
      statusHunian: res.statusHunian,
      tipeRumah: res.tipeRumah,
      tagihanBulanan: res.tagihanBulanan || 100000,
      pin: res.pin || '1234'
    });
  };

  // Open "Daftarkan Warga Baru Datang" for a specific vacant lot
  const handleOpenRegisterNewResident = (res: Resident) => {
    setEditingResident(res);
    setEditFormData({
      nama: '',
      noWhatsapp: '',
      statusHunian: 'Dihuni Tetap',
      tipeRumah: res.tipeRumah || 'Standar',
      tagihanBulanan: res.tagihanBulanan || 100000,
      pin: res.pin || '1234'
    });
  };

  // Submit Profile Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;

    try {
      setIsSaving(true);
      const cleanedName = editFormData.nama.trim();
      const isOccupied = cleanedName.length > 0 && editFormData.statusHunian !== 'Rumah Kosong';

      await updateResident(editingResident.id, {
        nama: cleanedName.length > 0 ? cleanedName : '(Belum Tercatat / Kosong)',
        noWhatsapp: editFormData.noWhatsapp.trim() || '-',
        statusHunian: isOccupied ? editFormData.statusHunian : 'Rumah Kosong',
        tipeRumah: editFormData.tipeRumah,
        tagihanBulanan: editFormData.tagihanBulanan,
        pin: editFormData.pin
      });

      setSaveSuccessMsg(`Data unit ${editingResident.blok} berhasil disimpan!`);
      setTimeout(() => {
        setSaveSuccessMsg(null);
        setEditingResident(null);
        if (onResidentUpdated) onResidentUpdated();
      }, 900);
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Add New Resident (either fill existing vacant lot or create a brand new unit)
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addMode === 'FILL_VACANT') {
      const targetVacantId = selectedVacantLotId || (vacantResidents[0]?.id ?? '');
      if (!targetVacantId) {
        alert('Tidak ada kavling kosong yang dipilih. Silakan pilih mode Tambah Kavling Baru.');
        return;
      }
      const targetLot = vacantResidents.find(v => v.id === targetVacantId);
      if (!targetLot) {
        alert('Kavling kosong tidak ditemukan.');
        return;
      }

      const cleanedName = addFormData.nama.trim();
      if (!cleanedName) {
        alert('Masukkan nama kepala keluarga warga baru yang datang!');
        return;
      }

      try {
        setIsAdding(true);
        await updateResident(targetLot.id, {
          nama: cleanedName,
          noWhatsapp: addFormData.noWhatsapp.trim() || '-',
          statusHunian: addFormData.statusHunian === 'Rumah Kosong' ? 'Dihuni Tetap' : addFormData.statusHunian,
          tipeRumah: addFormData.tipeRumah,
          tagihanBulanan: addFormData.tagihanBulanan || 100000,
          pin: addFormData.pin || '1234'
        });

        setAddSuccessMsg(`Warga baru (${cleanedName}) berhasil didaftarkan ke unit ${targetLot.blok}!`);
        setTimeout(() => {
          setAddSuccessMsg(null);
          setIsAddModalOpen(false);
          setAddFormData({
            blokGroup: 'B3',
            nomorRumah: '',
            nama: '',
            noWhatsapp: '',
            statusHunian: 'Dihuni Tetap',
            tipeRumah: 'Standar',
            tagihanBulanan: 100000,
            pin: '1234'
          });
          if (onResidentUpdated) onResidentUpdated();
        }, 900);
      } catch (err: any) {
        alert(`Gagal mendaftarkan warga ke kavling kosong: ${err.message}`);
      } finally {
        setIsAdding(false);
      }
      return;
    }

    // NEW_LOT mode: Can create either an occupied unit or a vacant unit
    if (!addFormData.nomorRumah) {
      alert('Nomor unit rumah harus diisi!');
      return;
    }
    const cleanNum = addFormData.nomorRumah.trim().padStart(2, '0');
    const blokCode = `${addFormData.blokGroup}/${cleanNum}`;

    try {
      setIsAdding(true);
      const cleanedName = addFormData.nama.trim();
      const isOccupied = cleanedName.length > 0 && addFormData.statusHunian !== 'Rumah Kosong';

      await addResident({
        blok: blokCode,
        blokGroup: addFormData.blokGroup,
        nomorRumah: cleanNum,
        nama: isOccupied ? cleanedName : '(Belum Tercatat / Kosong)',
        noWhatsapp: addFormData.noWhatsapp.trim() || '-',
        statusHunian: isOccupied ? addFormData.statusHunian : 'Rumah Kosong',
        tipeRumah: addFormData.tipeRumah,
        tagihanBulanan: addFormData.tagihanBulanan || 100000,
        pin: addFormData.pin || '1234'
      });

      setAddSuccessMsg(
        isOccupied
          ? `Warga baru unit ${blokCode} (${cleanedName}) berhasil ditambahkan!`
          : `Kavling kosong baru unit ${blokCode} berhasil ditambahkan ke database!`
      );
      setTimeout(() => {
        setAddSuccessMsg(null);
        setIsAddModalOpen(false);
        setAddFormData({
          blokGroup: 'B3',
          nomorRumah: '',
          nama: '',
          noWhatsapp: '',
          statusHunian: 'Dihuni Tetap',
          tipeRumah: 'Standar',
          tagihanBulanan: 100000,
          pin: '1234'
        });
        if (onResidentUpdated) onResidentUpdated();
      }, 900);
    } catch (err: any) {
      alert(`Gagal menambahkan kavling / warga: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  // Confirm Delete Permanently
  const handleConfirmDeletePermanently = async () => {
    if (!deleteConfirmResident) return;
    try {
      setIsDeleting(true);
      await deleteResident(deleteConfirmResident.id, deleteConfirmResident.nama, deleteConfirmResident.blok);
      setDeleteConfirmResident(null);
      if (onResidentUpdated) onResidentUpdated();
    } catch (err: any) {
      alert(`Gagal menghapus data warga: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Resident to Vacant
  const handleResetToVacant = async () => {
    if (!deleteConfirmResident) return;
    try {
      setIsDeleting(true);
      await updateResident(deleteConfirmResident.id, {
        nama: '(Belum Tercatat / Kosong)',
        noWhatsapp: '-',
        statusHunian: 'Rumah Kosong'
      });
      setDeleteConfirmResident(null);
      if (onResidentUpdated) onResidentUpdated();
    } catch (err: any) {
      alert(`Gagal mengosongkan data warga: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Change Month Cell Status
  const handleUpdateMonthStatus = async (status: MonthPaymentStatus) => {
    if (!cellEditModal) return;
    try {
      setIsUpdatingCell(true);
      await updateResidentMonthStatus(
        cellEditModal.resident.id,
        cellEditModal.month,
        status,
        status === 'LUNAS' || status === 'MENUNGGAK' ? 100000 : 0,
        cellEditModal.resident
      );
      setCellEditModal(null);
      if (onResidentUpdated) onResidentUpdated();
    } catch (err: any) {
      alert(`Gagal memperbarui status: ${err.message}`);
    } finally {
      setIsUpdatingCell(false);
    }
  };

  // Export Spreadsheet to CSV
  const handleExportCSV = () => {
    const headers = [
      'No', 'Blok', 'No Unit', 'Nama Kepala Keluarga', 'Status Hunian',
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
      'Total Setoran (Rp)', 'Total Tunggakan (Rp)'
    ];

    const rows = sortedResidents.map((r, idx) => {
      const getMonthVal = (m: MonthKey) => {
        const item = r.monthlyLedger?.[m];
        if (!item) return '-';
        if (item.status === 'LUNAS') return '100000';
        if (item.status === 'MENUNGGAK') return 'KUNING (MENUNGGAK)';
        if (item.status === 'KOSONG') return 'KOSONG';
        return '-';
      };

      return [
        idx + 1,
        `"${r.blok}"`,
        r.nomorRumah,
        `"${r.nama}"`,
        `"${r.statusHunian}"`,
        getMonthVal('Jan'),
        getMonthVal('Feb'),
        getMonthVal('Mar'),
        getMonthVal('Apr'),
        getMonthVal('Mei'),
        getMonthVal('Jun'),
        getMonthVal('Jul'),
        getMonthVal('Agt'),
        getMonthVal('Sep'),
        getMonthVal('Okt'),
        getMonthVal('Nov'),
        getMonthVal('Des'),
        r.totalSetoran || 0,
        r.totalTunggakan || 0
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_IPL_Saung_Kebun_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get color for block badge
  const getBlockColorClass = (blokGroup: string) => {
    switch (blokGroup) {
      case 'B3': return 'bg-amber-500 text-white border-amber-600';
      case 'B5': return 'bg-emerald-500 text-white border-emerald-600';
      case 'B6': return 'bg-cyan-500 text-white border-cyan-600';
      case 'B7': return 'bg-emerald-600 text-white border-emerald-700';
      case 'B8': return 'bg-orange-500 text-white border-orange-600';
      case 'B8-Ext': return 'bg-purple-600 text-white border-purple-700';
      default: return 'bg-slate-500 text-white border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER & TOP BANNER */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Database Resmi Saung Kebun
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <DollarSign className="w-3.5 h-3.5" />
                Tarif IPL: Rp 100.000 / Bulan
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Pencatatan & Matriks Iuran Bulanan IPL
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Sistem buku kas digital perumahan Saung Kebun dengan integrasi data 141 kavling warga,
              monitoring status setoran bulanan (Jan–Des 2026), pelacakan tunggakan kuning, dan transparansi keuangan real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md cursor-pointer"
              title="Tambah unit warga baru ke database"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Warga</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all shadow-sm cursor-pointer"
              title="Unduh format spreadsheet CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all shadow-sm"
              title="Cetak laporan rekapitulasi"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STATS OVERVIEW CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Total Iuran Terkumpul 2026</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {formatRupiah(matrixStats.grandTotalPaid)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">B6+B7: Rp 23.500.000 (sesuai sheet)</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Total Tunggakan Warga</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {formatRupiah(matrixStats.grandTotalMenunggak)}
            </p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">Posisi sel kuning di buku kas</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Hunian Terisi vs Kosong</p>
            <p className="text-xl font-bold text-white mt-1">
              {matrixStats.occupiedCount} <span className="text-xs font-normal text-slate-400">/ {residents.length} Kavling</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{matrixStats.vacantCount} unit rumah kosong / merah</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Kepatuhan Periode Berjalan</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">
              {matrixStats.occupiedCount > 0
                ? Math.round((residents.filter(r => r.statusBulanIni === 'Lunas').length / matrixStats.occupiedCount) * 100)
                : 0}%
            </p>
            <p className="text-[11px] text-cyan-300/80 mt-0.5">September 2026</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB CONTROLS & COLOR LEGEND BAR */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Tab Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('MATRIX')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'MATRIX'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Matriks Iuran Bulanan (Jan - Des)</span>
            </button>
            <button
              onClick={() => setActiveTab('TABLE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'TABLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Daftar & Profil Warga</span>
            </button>
          </div>

          {/* Color Legend (Sesuai Aturan User) */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-semibold text-slate-600">Panduan Warna:</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>100.000 (Lunas)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Menunggak</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>(-) Kavling Kosong</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>(-) Jan (Setor Mulai Feb)</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="pt-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Block Selection Pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter Blok:</span>
            {availableGroups.map(grp => (
              <button
                key={grp}
                onClick={() => {
                  setSelectedGroup(grp);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGroup === grp
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {getGroupLabel(grp)}
              </button>
            ))}
          </div>

          {/* Search Input & Occupancy Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari warga, nomor blok..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedOccupancy}
              onChange={e => {
                setSelectedOccupancy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Hunian</option>
              <option value="OCCUPIED">Dihuni Tetap</option>
              <option value="VACANT">Rumah Kosong</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. VIEW 1: SPREADSHEET MATRIX (JAN - DES) */}
      {/* ======================================================== */}
      {activeTab === 'MATRIX' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Buku Matriks Iuran IPL Saung Kebun 2026
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan {sortedResidents.length} kavling. Klik pada sel bulan untuk mengubah status pembayaran secara cepat.
              </p>
            </div>
            <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
              💡 Klik sembarang sel bulan untuk input / ubah status setoran
            </div>
          </div>

          <div className="overflow-x-auto max-h-[660px] relative rounded-b-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white uppercase text-[11px] sticky top-0 z-20 select-none tracking-wider shadow-sm">
                <tr>
                  <th className="py-3 px-2 border-r border-slate-800 text-center w-10 font-mono text-slate-400">No</th>
                  <th className="py-3 px-2.5 border-r border-slate-800 text-center w-16">Blok</th>
                  <th className="py-3 px-2 border-r border-slate-800 text-center w-12">No</th>
                  <th className="py-3 px-3.5 border-r border-slate-800 min-w-[240px]">Nama Kepala Keluarga</th>
                  <th className="py-3 px-2.5 border-r border-slate-800 text-center min-w-[110px]">Status IPL</th>
                  {MONTH_KEYS.map((m) => (
                    <th
                      key={m}
                      className={`py-3 px-1.5 border-r border-slate-800 text-center min-w-[68px] ${
                        m === 'Jan' ? 'bg-slate-800/90 text-slate-300' : ''
                      }`}
                    >
                      <span className="block font-bold">{m}</span>
                      <span className="text-[9px] font-normal opacity-70 block">
                        {m === 'Jan' ? '(-) Mulai Feb' : '100k'}
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-3.5 text-right min-w-[125px] bg-slate-950 border-l border-slate-800">
                    Total Setoran
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-sans">
                {sortedResidents.map((resident, index) => {
                  const empty = isResidentEmpty(resident);
                  const isAllRedVacant = empty && (!resident.totalSetoran || resident.totalSetoran === 0);

                  return (
                    <tr
                      key={resident.id}
                      className={`hover:bg-emerald-50/30 transition-colors ${
                        isAllRedVacant ? 'bg-rose-50/20' : index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      {/* Sequential Row No */}
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100">
                        {index + 1}
                      </td>

                      {/* Blok Group Badge */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold shadow-2xs ${getBlockColorClass(
                            resident.blokGroup
                          )}`}
                        >
                          {resident.blokGroup}
                        </span>
                      </td>

                      {/* Unit Number */}
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-100 font-mono">
                        {resident.nomorRumah}
                      </td>

                      {/* Resident Name & Actions */}
                      <td className="py-2.5 px-3 border-r border-slate-100 min-w-[240px]">
                        {empty ? (
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                              <span className="text-slate-400 italic text-[11px] truncate">
                                {resident.nama || '(Kosong)'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenRegisterNewResident(resident)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
                                title="Daftarkan warga baru yang datang ke kavling ini"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>+ Warga Baru</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(resident)}
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Kavling Kosong"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmResident(resident)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Kavling Kosong dari Database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-slate-900 truncate max-w-[145px]" title={resident.nama}>
                              {resident.nama}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(resident)}
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Profil Warga"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmResident(resident)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus / Kosongkan Data Warga"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Color-coded Status IPL Badge */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100 whitespace-nowrap">
                        {empty ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Kosong
                          </span>
                        ) : resident.statusBulanIni === 'Lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>LUNAS</span>
                          </span>
                        ) : resident.statusBulanIni === 'Menunggak' ? (
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

                      {/* 12 Month Matrix Cells */}
                      {MONTH_KEYS.map((mKey) => {
                        const cell = resident.monthlyLedger?.[mKey];
                        const status: MonthPaymentStatus = cell?.status || 'KOSONG';

                        // Kolom Jan: setoran dimulai Februari, tampilkan (-) rapih
                        if (mKey === 'Jan') {
                          return (
                            <td
                              key={mKey}
                              onClick={() =>
                                setCellEditModal({
                                  resident,
                                  month: mKey,
                                  currentStatus: status,
                                  currentAmount: cell?.amount || 100000
                                })
                              }
                              className="py-2.5 px-1 text-center border-r border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-colors select-none"
                              title="Januari: Pembayaran IPL Saung Kebun dimulai Februari (-)"
                            >
                              <span className="text-[11px] font-semibold text-slate-400">
                                (-)
                              </span>
                            </td>
                          );
                        }

                        // Bulan Feb - Des: Visual rules sesuai instruksi user
                        if (status === 'LUNAS') {
                          return (
                            <td
                              key={mKey}
                              onClick={() =>
                                setCellEditModal({
                                  resident,
                                  month: mKey,
                                  currentStatus: status,
                                  currentAmount: cell?.amount || 100000
                                })
                              }
                              className="py-2 px-1 text-center border-r border-slate-100 bg-white hover:bg-emerald-50/60 cursor-pointer transition-colors select-none"
                              title={`${MONTH_NAMES[mKey]}: Lunas Rp 100.000`}
                            >
                              <div className="mx-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200/90 shadow-2xs transition-colors">
                                100.000
                              </div>
                            </td>
                          );
                        } else if (status === 'MENUNGGAK') {
                          return (
                            <td
                              key={mKey}
                              onClick={() =>
                                setCellEditModal({
                                  resident,
                                  month: mKey,
                                  currentStatus: status,
                                  currentAmount: cell?.amount || 100000
                                })
                              }
                              className="py-2 px-1 text-center border-r border-slate-100 bg-amber-50/40 hover:bg-amber-100/50 cursor-pointer transition-colors select-none"
                              title={`${MONTH_NAMES[mKey]}: MENUNGGAK (Belum Bayar Rp 100.000)`}
                            >
                              <div className="mx-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-[9px] border border-amber-300 shadow-2xs tracking-tight transition-colors">
                                Menunggak
                              </div>
                            </td>
                          );
                        } else if (status === 'KOSONG') {
                          // Sel merah diberi tanda (-) saja agar lebih rapih & estetik
                          return (
                            <td
                              key={mKey}
                              onClick={() =>
                                setCellEditModal({
                                  resident,
                                  month: mKey,
                                  currentStatus: status,
                                  currentAmount: cell?.amount || 100000
                                })
                              }
                              className="py-2 px-1 text-center border-r border-slate-100 bg-rose-50/30 hover:bg-rose-100/40 cursor-pointer transition-colors select-none"
                              title={`${MONTH_NAMES[mKey]}: Kavling Kosong / Tanpa Tagihan (-)`}
                            >
                              <div className="mx-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-500 font-bold text-[11px] border border-rose-200/60 transition-colors">
                                (-)
                              </div>
                            </td>
                          );
                        }

                        // BELUM_BAYAR / periode lain
                        return (
                          <td
                            key={mKey}
                            onClick={() =>
                              setCellEditModal({
                                resident,
                                month: mKey,
                                currentStatus: status,
                                currentAmount: cell?.amount || 100000
                              })
                            }
                            className="py-2.5 px-1 text-center border-r border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors select-none text-slate-300"
                            title={`${MONTH_NAMES[mKey]}: Belum Dibayar`}
                          >
                            <span className="text-[11px] font-medium text-slate-300">-</span>
                          </td>
                        );
                      })}

                      {/* Row Total Setoran */}
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 bg-slate-50/50 border-l border-slate-100 font-mono text-[11px]">
                        {resident.totalSetoran && resident.totalSetoran > 0 ? (
                          <span className="text-emerald-700 font-extrabold">
                            {formatRupiah(resident.totalSetoran)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Rp 0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Sticky / Fixed Footer with Month Column Totals */}
              <tfoot className="bg-slate-900 text-white text-xs font-bold sticky bottom-0 z-20 border-t-2 border-slate-700">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider text-slate-300 border-r border-slate-700">
                    Total Masuk Per Bulan:
                  </td>
                  {MONTH_KEYS.map((m) => {
                    const totalMonth = matrixStats.monthlySums[m].totalPaid;
                    return (
                      <td
                        key={m}
                        className="py-3 px-1 text-center border-r border-slate-700 text-[10px] font-extrabold text-emerald-300"
                      >
                        {totalMonth > 0 ? (totalMonth / 1000).toLocaleString('id-ID') + 'k' : '0'}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-right text-emerald-400 font-extrabold text-sm border-l border-slate-700">
                    {formatRupiah(matrixStats.grandTotalPaid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. VIEW 2: RESIDENT DIRECTORY TABLE */}
      {/* ======================================================== */}
      {activeTab === 'TABLE' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-emerald-600" />
              Direktori & Profil Warga Perumahan Saung Kebun
            </h2>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Warga</span>
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {paginatedResidents.length} dari {filteredResidents.length} data
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Blok & Unit</th>
                  <th className="py-3 px-3">Nama Kepala Keluarga</th>
                  <th className="py-3 px-3">Kontak WhatsApp</th>
                  <th className="py-3 px-3 text-center">Status Hunian</th>
                  <th className="py-3 px-3 text-right">Tarif IPL</th>
                  <th className="py-3 px-3 text-center">Status Bulan Ini</th>
                  <th className="py-3 px-3 text-right">Tunggakan</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedResidents.map((r, index) => {
                  const empty = isResidentEmpty(r);
                  const isCommittee = ['B03/07', 'B07/16', 'B08/05', 'B08/06', 'B05/21', 'B05/24'].includes(r.blok);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-medium">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${getBlockColorClass(
                              r.blokGroup
                            )}`}
                          >
                            {r.blok}
                          </span>
                          {isCommittee && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                              Pengurus
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {empty ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal italic">
                              {r.nama || '(Belum Tercatat / Kosong)'}
                            </span>
                            <button
                              onClick={() => handleOpenRegisterNewResident(r)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold border border-emerald-300 transition-colors cursor-pointer"
                              title="Daftarkan warga baru datang ke unit ini"
                            >
                              <UserPlus className="w-3 h-3 text-emerald-600" />
                              <span>+ Warga Baru</span>
                            </button>
                          </div>
                        ) : (
                          <span>{r.nama}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {r.noWhatsapp !== '-' ? (
                          <a
                            href={`https://wa.me/${r.noWhatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            {r.noWhatsapp}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            r.statusHunian === 'Dihuni Tetap'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.statusHunian === 'Disewa/Kontrak'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {r.statusHunian}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {formatRupiah(r.tagihanBulanan)}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {r.statusBulanIni === 'Lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>LUNAS</span>
                          </span>
                        ) : r.statusBulanIni === 'Menunggak' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>MENUNGGAK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>BELUM BAYAR</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-bold">
                        {r.totalTunggakan > 0 ? (
                          <span className="text-amber-600">{formatRupiah(r.totalTunggakan)}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Rp 0</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {empty ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenRegisterNewResident(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                              title="Daftarkan warga baru datang ke kavling ini"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Warga</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Data Kavling Kosong"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmResident(r)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Hapus Kavling Kosong Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Data Warga"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmResident(r)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Hapus / Kosongkan Data Warga"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectResident(r)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="Lihat Profil & E-Card"
                            >
                              <User className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Halaman <span className="font-semibold text-slate-900">{currentPage}</span> dari{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span> ({filteredResidents.length} total)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'border border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. QUICK MONTH CELL EDIT MODAL */}
      {/* ======================================================== */}
      {cellEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${getBlockColorClass(
                    cellEditModal.resident.blokGroup
                  )}`}
                >
                  {cellEditModal.resident.blok}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {MONTH_NAMES[cellEditModal.month]} 2026
                </h3>
              </div>
              <button
                onClick={() => setCellEditModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-xs text-slate-500">
                Warga:{' '}
                <strong className="text-slate-800">{cellEditModal.resident.nama}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Pilih status pembayaran iuran IPL untuk bulan {MONTH_NAMES[cellEditModal.month]}:
              </p>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {/* 1. LUNAS (100.000) */}
                <button
                  type="button"
                  disabled={isUpdatingCell}
                  onClick={() => handleUpdateMonthStatus('LUNAS')}
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold">LUNAS (Rp 100.000)</p>
                      <p className="text-[11px] text-emerald-700 font-normal">Sudah dibayar / diverifikasi</p>
                    </div>
                  </div>
                  {cellEditModal.currentStatus === 'LUNAS' && (
                    <Check className="w-4 h-4 text-emerald-700" />
                  )}
                </button>

                {/* 2. MENUNGGAK (KUNING) */}
                <button
                  type="button"
                  disabled={isUpdatingCell}
                  onClick={() => handleUpdateMonthStatus('MENUNGGAK')}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <p className="font-extrabold">MENUNGGAK (Warna Kuning)</p>
                      <p className="text-[11px] text-amber-800 font-normal">Menunggak tagihan IPL Rp 100.000</p>
                    </div>
                  </div>
                  {cellEditModal.currentStatus === 'MENUNGGAK' && (
                    <Check className="w-4 h-4 text-amber-800" />
                  )}
                </button>

                {/* 3. KOSONG (MERAH DENGAN TANDA -) */}
                <button
                  type="button"
                  disabled={isUpdatingCell}
                  onClick={() => handleUpdateMonthStatus('KOSONG')}
                  className="flex items-center justify-between p-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 font-semibold text-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <p className="font-bold">(-) KOSONG (Warna Merah)</p>
                      <p className="text-[11px] text-rose-700 font-normal">Kavling kosong / belum tercatat / tanpa tagihan</p>
                    </div>
                  </div>
                  {cellEditModal.currentStatus === 'KOSONG' && (
                    <Check className="w-4 h-4 text-rose-700" />
                  )}
                </button>

                {/* 4. BELUM MASUK PERIODE */}
                <button
                  type="button"
                  disabled={isUpdatingCell}
                  onClick={() => handleUpdateMonthStatus('BELUM_BAYAR')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0" />
                    <div>
                      <p className="font-semibold">BELUM BAYAR (Periode Mendatang)</p>
                      <p className="text-[11px] text-slate-500">Status standar belum jatuh tempo</p>
                    </div>
                  </div>
                  {cellEditModal.currentStatus === 'BELUM_BAYAR' && (
                    <Check className="w-4 h-4 text-slate-700" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCellEditModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. EDIT PROFILE / KAVLING RESIDENT MODAL */}
      {/* ======================================================== */}
      {editingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mb-1 shadow-xs ${getBlockColorClass(
                    editingResident.blokGroup
                  )}`}
                >
                  {editingResident.blok}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {isResidentEmpty(editingResident)
                    ? `Kelola / Daftarkan Warga Unit ${editingResident.blok}`
                    : `Perbarui Data Warga Unit ${editingResident.blok}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {isResidentEmpty(editingResident)
                    ? 'Unit ini saat ini berstatus Rumah Kosong / Belum Tercatat'
                    : `Penghuni: ${editingResident.nama}`}
                </p>
              </div>
              <button
                onClick={() => setEditingResident(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-900">{saveSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="py-4 space-y-4">
                {isResidentEmpty(editingResident) && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Daftarkan Warga Baru Datang:</p>
                      <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                        Kavling ini sebelumnya kosong. Isi nama kepala keluarga di bawah untuk mengaktifkan hunian ini. Jika tetap kosong, Anda bisa biarkan nama kosong.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kepala Keluarga
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: ASEP SUKARMA (Kosongkan jika rumah kosong)"
                    value={editFormData.nama}
                    onChange={e => setEditFormData({ ...editFormData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Biarkan kosong untuk menetapkan status unit sebagai "(Belum Tercatat / Kosong)".
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-8800-1001"
                    value={editFormData.noWhatsapp}
                    onChange={e => setEditFormData({ ...editFormData, noWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status Hunian
                    </label>
                    <select
                      value={editFormData.statusHunian}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          statusHunian: e.target.value as any
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Dihuni Tetap">Dihuni Tetap</option>
                      <option value="Disewa/Kontrak">Disewa/Kontrak</option>
                      <option value="Rumah Kosong">Rumah Kosong</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipe Kavling
                    </label>
                    <select
                      value={editFormData.tipeRumah}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          tipeRumah: e.target.value as any
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Standar">Standar</option>
                      <option value="Hook">Hook (Pojok)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarif Iuran Bulanan (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      value={editFormData.tagihanBulanan}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          tagihanBulanan: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN Akses E-Card
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editFormData.pin}
                      onChange={e => setEditFormData({ ...editFormData, pin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const target = editingResident;
                      setEditingResident(null);
                      setDeleteConfirmResident(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {isResidentEmpty(editingResident) ? 'Hapus Kavling' : 'Hapus / Kosongkan'}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingResident(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Data'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. ADD RESIDENT / KAVLING MODAL */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah / Daftarkan Warga</h3>
                  <p className="text-xs text-slate-500">Isi kavling kosong atau buat kavling baru</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-900">{addSuccessMsg}</p>
                <p className="text-xs text-slate-500">Tersimpan otomatis ke database Cloud Firestore.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveAdd} className="py-3 space-y-3.5">
                {/* Mode Selector Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setAddMode('FILL_VACANT')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      addMode === 'FILL_VACANT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Isi Kavling Kosong ({vacantResidents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode('NEW_LOT')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      addMode === 'NEW_LOT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    + Kavling / Unit Baru
                  </button>
                </div>

                {/* MODE 1: FILL EXISTING VACANT LOT */}
                {addMode === 'FILL_VACANT' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                      <p className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Pendaftaran Warga Baru Datang
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Pilih salah satu kavling kosong yang ada di perumahan, lalu masukkan nama warga baru yang menempatinya.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Kavling Kosong
                      </label>
                      <select
                        value={selectedVacantLotId || (vacantResidents[0]?.id ?? '')}
                        onChange={e => setSelectedVacantLotId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {vacantResidents.length === 0 ? (
                          <option value="">Semua kavling terisi penuh</option>
                        ) : (
                          vacantResidents.map(v => (
                            <option key={v.id} value={v.id}>
                              Unit {v.blok} &bull; {v.nama} ({v.tipeRumah})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Kepala Keluarga Baru *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: BUDI SANTOSO"
                        value={addFormData.nama}
                        onChange={e => setAddFormData({ ...addFormData, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* MODE 2: CREATE BRAND NEW LOT */}
                {addMode === 'NEW_LOT' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Grup Blok
                        </label>
                        <select
                          value={addFormData.blokGroup}
                          onChange={e => setAddFormData({ ...addFormData, blokGroup: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                        >
                          <option value="B3">Blok B3</option>
                          <option value="B5">Blok B5</option>
                          <option value="B6">Blok B6</option>
                          <option value="B7">Blok B7</option>
                          <option value="B8">Blok B8</option>
                          <option value="B8-Ext">Blok B8-Ext</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor Unit / Rumah *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 27"
                          value={addFormData.nomorRumah}
                          onChange={e => setAddFormData({ ...addFormData, nomorRumah: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Kepala Keluarga (Opsional jika kavling kosong)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: BUDI SANTOSO (Kosongkan jika kavling kosong)"
                        value={addFormData.nama}
                        onChange={e => setAddFormData({ ...addFormData, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Shared Contact & Occupancy Fields */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={addFormData.noWhatsapp}
                    onChange={e => setAddFormData({ ...addFormData, noWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status Hunian
                    </label>
                    <select
                      value={addFormData.statusHunian}
                      onChange={e => setAddFormData({ ...addFormData, statusHunian: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Dihuni Tetap">Dihuni Tetap</option>
                      <option value="Disewa/Kontrak">Disewa/Kontrak</option>
                      <option value="Rumah Kosong">Rumah Kosong</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipe Rumah
                    </label>
                    <select
                      value={addFormData.tipeRumah}
                      onChange={e => setAddFormData({ ...addFormData, tipeRumah: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Standar">Standar</option>
                      <option value="Hook">Hook</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarif Iuran (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      value={addFormData.tagihanBulanan}
                      onChange={e => setAddFormData({ ...addFormData, tagihanBulanan: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN Akses E-Card
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={addFormData.pin}
                      onChange={e => setAddFormData({ ...addFormData, pin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-center"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>
                      {isAdding
                        ? 'Menyimpan...'
                        : addMode === 'FILL_VACANT'
                        ? 'Daftarkan Warga Baru'
                        : 'Simpan Kavling / Warga'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. DELETE RESIDENT CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteConfirmResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isResidentEmpty(deleteConfirmResident)
                    ? 'Hapus Kavling Kosong'
                    : 'Hapus / Kosongkan Data Warga'}
                </h3>
                <p className="text-xs text-slate-500">
                  Unit <span className="font-bold text-slate-800">{deleteConfirmResident.blok}</span> &bull; {deleteConfirmResident.nama}
                </p>
              </div>
            </div>

            {isResidentEmpty(deleteConfirmResident) ? (
              <>
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    Konfirmasi Hapus Kavling Kosong
                  </p>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Kavling unit <strong>{deleteConfirmResident.blok}</strong> saat ini kosong / belum tercatat. Tindakan ini akan menghapus dokumen unit dari daftar dan Cloud Firestore.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDeletePermanently}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-300 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? 'Menghapus dari Database...' : 'Ya, Hapus Permanen Kavling Ini'}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Pilih tindakan untuk unit ini:</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Anda dapat memilih untuk mengosongkan data penghuni (status menjadi Rumah Kosong) atau menghapus unit secara permanen dari database.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Option 1: Kosongkan Data */}
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleResetToVacant}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-all text-left cursor-pointer disabled:opacity-50"
                  >
                    <div>
                      <p className="font-bold text-slate-900">1. Kosongkan Data (Set Rumah Kosong)</p>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Nama di-reset jadi "(Belum Tercatat / Kosong)", unit kavling tetap ada di daftar.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Hapus Permanen */}
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDeletePermanently}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs transition-all text-left cursor-pointer disabled:opacity-50"
                  >
                    <div>
                      <p className="font-bold text-rose-900">2. Hapus Permanen Unit dari Database</p>
                      <p className="text-[11px] text-rose-600 font-normal">
                        Dokumen unit {deleteConfirmResident.blok} akan dihapus sepenuhnya dari Cloud Firestore.
                      </p>
                    </div>
                  </button>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmResident(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
