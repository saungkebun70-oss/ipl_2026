import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Github,
  Zap,
  Server,
  FileCode,
  ShieldCheck,
  FolderGit2,
  Users,
  Shield,
  KeyRound,
  Building,
  Car
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GITHUB' | 'VERCEL' | 'ROLES' | 'CONFIG'>('GITHUB');
  const [githubUser, setGithubUser] = useState('syahandri685');
  const [copiedGitRemote, setCopiedGitRemote] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);

  if (!isOpen) return null;

  const gitRemoteCmd = `git remote add origin https://github.com/${githubUser || '<username>'}/sipl-saung-kebun.git\ngit branch -M main\ngit push -u origin main`;
  const cliCommand = 'npx vercel --prod';

  const handleCopyGitRemote = () => {
    navigator.clipboard.writeText(gitRemoteCmd);
    setCopiedGitRemote(true);
    setTimeout(() => setCopiedGitRemote(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-950 shadow-xs">
              <Github className="w-3 h-3" />
              GitHub &amp; Vercel Ready
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Warga, Admin &amp; Keamanan Siap Deploy
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Publish GitHub &amp; Vercel Hosting
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
            Panduan lengkap publish repository GitHub dan hosting otomatis di Vercel dengan hak akses terpisah untuk Akun Warga, Admin (Bendahara &amp; Ketua), serta Akun Keamanan (Satpam).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs overflow-x-auto no-scrollbar touch-pan-x">
          <button
            onClick={() => setActiveTab('GITHUB')}
            className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              activeTab === 'GITHUB'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 1. Publish GitHub
          </button>
          <button
            onClick={() => setActiveTab('VERCEL')}
            className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              activeTab === 'VERCEL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 2. Deploy Vercel
          </button>
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              activeTab === 'ROLES'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 3. Akun Multi-Peran
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              activeTab === 'CONFIG'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ File Config
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs leading-relaxed flex-1">
          {/* TAB 1: GITHUB */}
          {activeTab === 'GITHUB' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <Github className="w-4 h-4" />
                    <span>Status Git Lokal: Sudah Ter-commit (51 File)</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">Branch: main</span>
                </div>
                <p className="text-xs text-slate-300">
                  Semua kode portal (Warga, Bendahara, Ketua, Keamanan) serta konfigurasi build Vercel dan Firestore sudah di-commit secara rapi ke branch <code className="text-emerald-400 font-mono">main</code>.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Langkah Publish ke GitHub Anda:
                </h5>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                    <span>Buat Repository Kosong Baru di GitHub:</span>
                  </div>
                  <p className="text-slate-600">
                    Buka <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a>, beri nama repository (misal: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">sipl-saung-kebun</code>), dan jangan centang "Initialize with README".
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                    <span>Masukkan Username GitHub Anda:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-xs">github.com/</span>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="username-anda"
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 max-w-xs"
                    />
                    <span className="text-slate-500 font-mono text-xs">/sipl-saung-kebun.git</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">3</span>
                    <span>Jalankan Perintah Push ke GitHub:</span>
                  </div>
                  <div className="relative p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] leading-relaxed">
                    <pre className="overflow-x-auto whitespace-pre-wrap">{gitRemoteCmd}</pre>
                    <button
                      onClick={handleCopyGitRemote}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Salin Perintah Git"
                    >
                      {copiedGitRemote ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERCEL */}
          {activeTab === 'VERCEL' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Otomatisasi Penuh Vercel via GitHub Import
                    </h4>
                    <p className="text-slate-600 mt-1">
                      Setelah repository GitHub terhubung, setiap kali ada pembaruan kode, Vercel akan otomatis meng-compile dan memperbarui aplikasi secara live dalam ~45 detik.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Langkah Deploy di Vercel:
                </h5>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                    <span>Buka Vercel Dashboard Import:</span>
                  </div>
                  <p className="text-slate-600">
                    Kunjungi <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">vercel.com/new <ExternalLink className="w-3 h-3" /></a>, lalu klik <strong>Import</strong> pada repository <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">sipl-saung-kebun</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                    <span>Pengaturan Build Otomatis:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Framework Preset:</strong> Vite (Otomatis)</li>
                    <li><strong>Build Command:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm run build</code></li>
                    <li><strong>Output Directory:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist</code></li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">3</span>
                    <span>Opsi Deploy Langsung via CLI:</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs">
                    <span>{cliCommand}</span>
                    <button
                      onClick={handleCopyCli}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      {copiedCli ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 76 65" fill="none">
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                  <span>Buka Vercel Dashboard (Klik untuk Import)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: ROLES ACCESS GUIDE */}
          {activeTab === 'ROLES' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-900 text-xs mb-1">
                  Arsitektur Akses Portal Mandiri di Vercel Production
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Setelah website live di domain Vercel Anda, berikut panduan kredensial dan cara masuk untuk masing-masing peran:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Akun Warga */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Building className="w-4 h-4" />
                    <span>1. Akun Warga (141 Kavling)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Akses mandiri untuk seluruh penghuni Blok B3, B5, B6, B7, B8, dan Cadangan.
                  </p>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200 text-[11px] space-y-1 font-mono">
                    <div><strong>Cara Masuk:</strong> No Blok (e.g. B05/21)</div>
                    <div><strong>PIN Default:</strong> <span className="text-emerald-700 font-bold">1234</span></div>
                    <div><strong>Fitur:</strong> E-Card IPL, Riwayat, Bayar QRIS/VA, Unduh Kwitansi.</div>
                  </div>
                </div>

                {/* 2. Akun Bendahara */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-blue-800 font-bold">
                    <KeyRound className="w-4 h-4" />
                    <span>2. Admin Bendahara Kas</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Pengelola pembukuan, kasir, dan penagihan iuran warga.
                  </p>
                  <div className="p-2 bg-white rounded-xl border border-blue-200 text-[11px] space-y-1 font-mono">
                    <div><strong>Pengurus:</strong> Bp. Andriansyah (B07/16)</div>
                    <div><strong>Hak Akses:</strong> Kasir, Input Setoran, Catat Belanja, Broadcast WA.</div>
                  </div>
                </div>

                {/* 3. Akun Ketua */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-purple-800 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Admin Ketua Paguyuban</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Supervisi eksekutif anggaran, sensus kavling, dan maklumat warga.
                  </p>
                  <div className="p-2 bg-white rounded-xl border border-purple-200 text-[11px] space-y-1 font-mono">
                    <div><strong>Pengurus:</strong> Bp. Erlangga (B03/07)</div>
                    <div><strong>Hak Akses:</strong> Supervisi Kas, Maklumat Resmi, Audit Trail.</div>
                  </div>
                </div>

                {/* 4. Akun Keamanan */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>4. Petugas Keamanan (Satpam)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Operasional pos jaga gerbang, buku tamu, ronda, dan panic button.
                  </p>
                  <div className="p-2 bg-white rounded-xl border border-amber-200 text-[11px] space-y-1 font-mono">
                    <div><strong>Petugas:</strong> Bp. Mulyono / Bp. Sugih</div>
                    <div><strong>Hak Akses:</strong> Buku Tamu, Log Ronda, Panic Button, Interkom Kavling.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONFIG FILES */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900">File Konfigurasi yang Tersedia:</h5>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-slate-900">vercel.json</div>
                        <div className="text-[11px] text-slate-500">Routing rewrite SPA, Serverless API bridge, dan security headers.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Aktif</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-slate-900">api/index.ts</div>
                        <div className="text-[11px] text-slate-500">Serverless Function handler untuk Express backend.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Ready</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-slate-900">.github/workflows/deploy-vercel.yml</div>
                        <div className="text-[11px] text-slate-500">Pipeline otomatisasi CI/CD saat ada push ke git.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">CI/CD</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-slate-900">firebase-applet-config.json</div>
                        <div className="text-[11px] text-slate-500">Koneksi Cloud Firestore (asia-southeast1) real-time persistent.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Cloud Live</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dokumentasi lengkap: <strong>DEPLOY_VERCEL.md</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
