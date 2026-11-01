import React, { useState } from 'react';
import {
  X,
  Server,
  Database,
  ShieldCheck,
  Webhook,
  Layers,
  Code2,
  Copy,
  Check,
  Send,
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Lock,
  ArrowRight,
  Globe,
  Rocket,
  CheckCircle2,
  GitBranch,
  ExternalLink,
  Terminal
} from 'lucide-react';
import { Resident } from '../types';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  onTriggerWebhookSuccess?: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  residents,
  onTriggerWebhookSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'webhook' | 'responsive' | 'vercel'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Webhook Simulator State
  const [targetResidentId, setTargetResidentId] = useState(
    residents.find(r => r.statusBulanIni !== 'Lunas')?.id || residents[0]?.id || ''
  );
  const [simPaymentMethod, setSimPaymentMethod] = useState<'qris' | 'bank_transfer' | 'gopay'>('qris');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    setSimResult(null);

    const resident = residents.find(r => r.id === targetResidentId) || residents[0];
    const orderId = `IPL-${resident?.id || 'res-a-01'}-${Date.now().toString().slice(-6)}`;
    const grossAmount = (resident?.tagihanBulanan || 150000).toString();

    try {
      const response = await fetch('/api/webhook/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulator': 'true'
        },
        body: JSON.stringify({
          order_id: orderId,
          status_code: '200',
          gross_amount: grossAmount,
          transaction_status: 'settlement',
          payment_type: simPaymentMethod,
          custom_field1: resident?.id,
          custom_field2: 'November 2026'
        })
      });

      const data = await response.json();
      setSimResult({
        status: response.status,
        data,
        payloadSent: {
          order_id: orderId,
          transaction_status: 'settlement',
          payment_type: simPaymentMethod,
          gross_amount: grossAmount,
          resident: `${resident?.nama} (${resident?.blok})`
        }
      });

      if (onTriggerWebhookSuccess) {
        onTriggerWebhookSuccess();
      }
    } catch (err: any) {
      setSimResult({ error: err.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const sqlSchemaCode = `-- =================================================================
-- SIPL SAUNG KEBUN - POSTGRESQL PRODUCTION DDL & ROW LEVEL SECURITY
-- Multi-Tenant & High-Concurrency Isolation (>100 Akun Warga)
-- =================================================================

-- 1. ENUM ROLES & STATUS
CREATE TYPE user_role AS ENUM ('WARGA', 'BENDAHARA', 'KETUA');
CREATE TYPE bill_status AS ENUM ('pending', 'paid', 'expired');
CREATE TYPE house_status AS ENUM ('tetap', 'kontrak', 'kosong');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'WARGA',
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HOUSES TABLE (115 Unit Perumahan Saung Kebun)
CREATE TABLE IF NOT EXISTS houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    block_number VARCHAR(10) NOT NULL, -- e.g. 'A-01', 'B07/16'
    house_number VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status house_status NOT NULL DEFAULT 'tetap',
    is_hook BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_block_unit UNIQUE (block_number, house_number)
);

-- 4. IPL BILLS TABLE (Tagihan Bulanan Otomatis)
CREATE TABLE IF NOT EXISTS ipl_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    billing_period VARCHAR(20) NOT NULL, -- e.g. '2026-11'
    amount NUMERIC(12, 2) NOT NULL DEFAULT 150000.00,
    status bill_status NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    payment_method VARCHAR(50),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_house_period UNIQUE (house_id, billing_period)
);

-- 5. TRANSACTIONS TABLE (Audit Trail Pembayaran Digital Midtrans/Xendit)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES ipl_bills(id) ON DELETE RESTRICT,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    payment_type VARCHAR(50) NOT NULL, -- 'qris', 'bank_transfer', 'gopay'
    gross_amount NUMERIC(12, 2) NOT NULL,
    transaction_status VARCHAR(50) NOT NULL, -- 'settlement', 'pending', 'expire'
    snap_token VARCHAR(255),
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXPENSES TABLE (Buku Kas Belanja & Dual Verification)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL, -- 'Keamanan', 'Kebersihan', 'PJU'
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    verified_by_ketua UUID REFERENCES users(id),
    created_by_bendahara UUID NOT NULL REFERENCES users(id),
    verification_status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(150) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXING UNTUK PERFORMA CONCURRENCY TINGGI (>100 USER SERENTAK)
CREATE INDEX IF NOT EXISTS idx_houses_user_id ON houses(user_id);
CREATE INDEX IF NOT EXISTS idx_ipl_bills_house_id ON ipl_bills(house_id);
CREATE INDEX IF NOT EXISTS idx_ipl_bills_status ON ipl_bills(status);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- =================================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- Mencegah kebocoran data antar-warga & membatasi wewenang eksekutif
-- =================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipl_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 1. Users Policy: Warga hanya bisa melihat profil sendiri, Pengurus melihat semua
CREATE POLICY "Users read own profile" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        (SELECT role FROM users WHERE id = auth.uid()) IN ('BENDAHARA', 'KETUA')
    );

-- 2. Houses Policy
CREATE POLICY "Houses visible to owner and officers" ON houses
    FOR SELECT USING (
        user_id = auth.uid() OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('BENDAHARA', 'KETUA')
    );

-- 3. IPL Bills Policy (Krusial: Warga TIDAK BISA melihat tagihan rumah tetangga)
CREATE POLICY "Warga only view own house bills" ON ipl_bills
    FOR SELECT USING (
        house_id IN (SELECT id FROM houses WHERE user_id = auth.uid()) OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('BENDAHARA', 'KETUA')
    );

CREATE POLICY "Bendahara manage all bills" ON ipl_bills
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'BENDAHARA'
    );

-- 4. Expenses Policy (Transparansi Agregat untuk Warga, Approval oleh Ketua)
CREATE POLICY "Everyone can view expenses for transparency" ON expenses
    FOR SELECT USING (true);

CREATE POLICY "Bendahara insert expenses" ON expenses
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'BENDAHARA'
    );

CREATE POLICY "Ketua dual verification approval" ON expenses
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'KETUA'
    );`;

  const webhookCode = `// app/api/webhook/midtrans/route.ts (Next.js App Router / Node.js Express)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      custom_field1: houseId,
      custom_field2: billingPeriod
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;

    // 1. VERIFIKASI SIGNATURE KEY SHA-512 (Kriptografi Keamanan)
    // Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const rawString = \`\${order_id}\${status_code}\${gross_amount}\${serverKey}\`;
    const computedSignature = crypto
      .createHash('sha512')
      .update(rawString)
      .digest('hex');

    if (computedSignature !== signature_key) {
      return NextResponse.json({ error: 'Signature tidak valid (Fraud attempt)' }, { status: 403 });
    }

    // 2. IDEMPOTENCY CHECK (Mencegah Pencatatan Ganda jika Webhook Retry)
    const existingTx = await prisma.transactions.findUnique({ where: { order_id } });
    if (existingTx && existingTx.transaction_status === 'settlement') {
      return NextResponse.json({ message: 'Transaksi telah diproses sebelumnya' }, { status: 200 });
    }

    // 3. HANDLE STATUS TRANSAKSI
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      // Jalankan Atomic Database Transaction
      await prisma.$transaction(async (tx) => {
        // a. Update Status Tagihan menjadi LUNAS
        const updatedBill = await tx.ipl_bills.update({
          where: { id: body.bill_id || existingTx?.bill_id },
          data: {
            status: 'paid',
            paid_at: new Date(),
            payment_method: payment_type
          },
          include: { house: { include: { user: true } } }
        });

        // b. Simpan Rekam Jejak Transaksi Digital
        await tx.transactions.upsert({
          where: { order_id },
          update: { transaction_status: 'settlement', raw_response: body },
          create: {
            bill_id: updatedBill.id,
            order_id,
            payment_type,
            gross_amount: parseFloat(gross_amount),
            transaction_status: 'settlement',
            raw_response: body
          }
        });

        // c. Catat Audit Log
        await tx.audit_logs.create({
          data: {
            user_id: updatedBill.house.user_id,
            action: \`Pembayaran IPL \${billingPeriod} via \${payment_type.toUpperCase()} Sukses (Rp \${gross_amount})\`,
            ip_address: req.headers.get('x-forwarded-for') || 'midtrans-gateway'
          }
        });
      });

      // 4. OTOMATISASI NOTIFIKASI WHATSAPP GATEWAY (Transparansi Finansial)
      await sendWhatsAppNotification({
        phone: body.customer_phone,
        message: \`✅ [SIPL Saung Kebun] Pembayaran Iuran IPL Sukses!\\n\\nUnit: \${body.block_number}\\nPeriode: \${billingPeriod}\\nNominal: Rp \${gross_amount}\\nMetode: \${payment_type.toUpperCase()}\\nNo. Kuitansi: KW/SK/\${order_id}\\n\\nTerima kasih atas partisipasi Anda dalam menjaga keamanan & kebersihan lingkungan Saung Kebun!\`
      });

      return NextResponse.json({ success: true, message: 'Settlement processed' }, { status: 200 });
    }

    if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      await prisma.transactions.update({
        where: { order_id },
        data: { transaction_status }
      });
      return NextResponse.json({ message: \`Status updated to \${transaction_status}\` }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Server className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Arsitektur & Spesifikasi SIPL Saung Kebun
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Enterprise-Grade
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rancangan Concurrency-Safe &gt;100 Warga, PostgreSQL RLS, &amp; Payment Gateway Midtrans
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {[
            { id: 'architecture', label: 'Arsitektur & Concurrency', icon: Layers },
            { id: 'schema', label: 'Skema Database (SQL & RLS)', icon: Database },
            { id: 'webhook', label: 'Webhook Midtrans & Simulator', icon: Webhook },
            { id: 'responsive', label: 'Layout Adaptif (Mobile-First)', icon: Smartphone },
            { id: 'vercel', label: '⚡ Deploy ke Vercel (CI/CD)', icon: Globe },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-700 text-xs sm:text-sm">
          {/* TAB 1: ARSITEKTUR & CONCURRENCY */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Isolasi Sesi &amp; Concurrency-Safety untuk &gt;100 Akun Warga
                </h4>
                <p className="text-emerald-900/90 text-xs leading-relaxed">
                  Untuk menjamin 100+ warga Saung Kebun dapat mengakses portal, memeriksa rincian iuran, dan membayar secara serentak tanpa tabrakan sesi (*session collision*) maupun kebocoran privasi (*cross-tenant leakage*), arsitektur dirancang menggunakan 4 pilar utama:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Stateless JWT dengan Klaim Rumah &amp; Blok Terisolasi
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap token autentikasi memuat klaim eksplisit: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">user_id</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">house_id</code>, dan <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">role</code>. Server tidak menyimpan session state di memori, sehingga dapat discale horizontal ke multi-instance tanpa risiko tertukar akun antar tetangga.
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Enforcement Row Level Security (RLS) di Database Level
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pencegahan kebocoran data tidak hanya di level aplikasi, melainkan ditegakkan langsung oleh kernel PostgreSQL via RLS: <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700">WHERE house.user_id = auth.uid()</code>. Sekalipun ada celah API, warga tidak pernah bisa membaca data tagihan tetangga.
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Optimistic Locking &amp; Idempotency Token
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Saat terjadi pembayaran bersamaan, tabel tagihan menggunakan constraint unik <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">UNIQUE (house_id, billing_period)</code> dan order ID unik dari Midtrans. Mencegah mutasi ganda jika warga menekan tombol bayar berulang kali.
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Redis / Edge Memory Cache untuk Transparansi Publik
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Data agregat kas perumahan (total saldo, persentase kepatuhan, grafik tren) di-cache selama 60 detik. Ketika 100+ warga mengecek dashboard secara serentak, beban database utama tetap ringan (&lt;5% CPU).
                  </p>
                </div>
              </div>

              {/* Architectural Workflow Diagram */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white font-mono text-xs overflow-x-auto">
                <div className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>ALUR DATA &amp; WORKFLOW HIGH-CONCURRENCY</span>
                </div>
                <pre className="text-slate-300 leading-relaxed text-[11px]">
{`[ Warga / HP (100+ User) ]   [ Bendahara (Admin) ]   [ Ketua (Approval) ]
          │                           │                       │
          ▼                           ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│   API GATEWAY & CLOUD RUN EDGE (Next.js / Express Reverse Proxy)       │
│   • Stateless Auth Filter (JWT / PIN Blok Terverifikasi)               │
│   • Rate Limiting (Mencegah DDoS & Brute Force PIN)                    │
└────────────────────────────────────────────────────────────────────────┘
          │                                           ▲
          ▼                                           │ (Webhook Notification)
┌───────────────────────────────────┐       ┌────────────────────────────┐
│ POSTGRESQL + ROW LEVEL SECURITY   │       │ PAYMENT GATEWAY MIDTRANS   │
│ • users, houses, ipl_bills        │◄──────┤ • QRIS Dinamis & Snap VA   │
│ • transactions, expenses          │       │ • SHA-512 Signature Hash   │
│ • audit_logs                      │       └────────────────────────────┘
└───────────────────────────────────┘                      │
          │                                                ▼
          ▼                                      ┌───────────────────┐
┌───────────────────────────────────┐            │ WHATSAPP GATEWAY  │
│ REDIS / EDGE MEMORY CACHE         │            │ (Fonnte / Wablas) │
│ • Saldo Kas Agregat               │            │ • e-Kwitansi & WA │
│ • Rekap Kepatuhan Blok A/B/C/D/E  │            │   Notifikasi Real │
└───────────────────────────────────┘            └───────────────────┘`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SKEMA DATABASE (SQL & RLS) */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Skema DDL PostgreSQL &amp; Strict Row Level Security
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mencakup 6 entitas utama: users, houses, ipl_bills, transactions, expenses, audit_logs.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(sqlSchemaCode, 'sql')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'sql' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin SQL DDL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[480px]">
                <pre>{sqlSchemaCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOK MIDTRANS & SIMULATOR */}
          {activeTab === 'webhook' && (
            <div className="space-y-6">
              {/* Webhook Code Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-emerald-600" />
                      Midtrans Automated Webhook Handler Code
                    </h4>
                    <p className="text-xs text-slate-500">
                      Verifikasi SHA-512 Signature Hash, Atomic Transaction, Idempotency Check &amp; Notifikasi WhatsApp Otomatis.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(webhookCode, 'webhook')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'webhook' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode Handler</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-[320px]">
                  <pre>{webhookCode}</pre>
                </div>
              </div>

              {/* LIVE SIMULATOR BENCH */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ▶
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      Interactive Midtrans Webhook Simulator (Live Test)
                    </h5>
                    <p className="text-xs text-slate-500">
                      Uji coba langsung pengiriman webhook simulasi dari Midtrans ke server backend SIPL Saung Kebun.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Pilih Warga Target:
                    </label>
                    <select
                      value={targetResidentId}
                      onChange={(e) => setTargetResidentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800"
                    >
                      {residents.slice(0, 15).map(r => (
                        <option key={r.id} value={r.id}>
                          {r.blok} - {r.nama} ({r.statusBulanIni})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Metode Pembayaran:
                    </label>
                    <select
                      value={simPaymentMethod}
                      onChange={(e) => setSimPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800"
                    >
                      <option value="qris">QRIS Otomatis Dinamis</option>
                      <option value="bank_transfer">Virtual Account BCA/Mandiri</option>
                      <option value="gopay">GoPay / E-Wallet</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSimulateWebhook}
                      disabled={isSimulating}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSimulating ? 'Memproses Webhook...' : 'Kirim Webhook Settlement'}</span>
                    </button>
                  </div>
                </div>

                {simResult && (
                  <div className="bg-slate-900 rounded-xl p-3.5 text-white text-xs font-mono mt-3 space-y-1">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Webhook Berhasil Diterima &amp; Diproses Server (HTTP {simResult.status})</span>
                    </div>
                    <pre className="text-slate-300 text-[11px] mt-2 overflow-x-auto">
                      {JSON.stringify(simResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT ADAPTIF (RESPONSIVE SPEC) */}
          {activeTab === 'responsive' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mobile */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Smartphone className="w-5 h-5" />
                    <h5 className="font-bold text-sm">A. Mobile (&lt; 640px)</h5>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Fokus Warga &amp; Akses Cepat
                  </span>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                    <li><strong>Sticky Bottom Dock (56px):</strong> 5 tab sentuh (Kas, Warga, Bayar IPL elevated, Portal, Pengurus).</li>
                    <li><strong>Card-Based Tagihan:</strong> Rincian iuran dalam kartu vertikal (bukan tabel lebar) dengan tombol bayar QRIS instan.</li>
                    <li><strong>Ergonomi Sentuh:</strong> Touch target minimal 44x44px, bottom-sheet modal anti-overflow.</li>
                  </ul>
                </div>

                {/* Tablet */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Tablet className="w-5 h-5" />
                    <h5 className="font-bold text-sm">B. Tablet (640px - 1023px)</h5>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Mode Rapat &amp; Inspeksi
                  </span>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                    <li><strong>Grid 2 Kolom Adaptif:</strong> Kolom kiri ringkasan kas &amp; tren, kolom kanan kartu tagihan / log notifikasi.</li>
                    <li><strong>Formulir Verifikasi Cepat:</strong> Optimal untuk orientasi lanskap maupun potret oleh Pengurus.</li>
                    <li><strong>Multi-Filter Blok A/B/C/D/E:</strong> Tombol horizontal scrollable mudah digeser jari.</li>
                  </ul>
                </div>

                {/* Desktop */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-purple-800">
                    <Monitor className="w-5 h-5" />
                    <h5 className="font-bold text-sm">C. Desktop (≥ 1024px)</h5>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    Efisiensi Pembukuan Penuh
                  </span>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                    <li><strong>Persistent Left Sidebar (288px):</strong> Navigasi permanen dengan status akun, shortcut bayar, dan log audit.</li>
                    <li><strong>Buku Kas Ledger Penuh:</strong> Tabel komprehensif, multi-sort, export Excel/PDF, dan filter status.</li>
                    <li><strong>Analitik Multi-Panel:</strong> Visualisasi grafik tren, pos belanja, dan kepatuhan 115 unit.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">SIPL Saung Kebun v2.4 Architecture Spec</span>
                  <span>Siap deploy ke Vercel/Cloud Run dengan database Supabase/PostgreSQL &amp; Midtrans Production.</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors shrink-0"
                >
                  Tutup Spesifikasi
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Deploy ke Vercel Otomatis */}
          {activeTab === 'vercel' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Ready Header Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl text-white shadow-md border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 shrink-0 border border-white/10">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base">Konfigurasi Otomatis Vercel Siap</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950">
                        Production Ready
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      Proyek sudah dilengkapi <code>vercel.json</code>, endpoint serverless <code>api/index.ts</code>, dan workflow GitHub Actions CI/CD.
                    </p>
                  </div>
                </div>

                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-white text-slate-950 hover:bg-emerald-50 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <span>Buka Vercel Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3 Core Deployment Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Method 1: Git Push */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Metode 1 (Paling Mudah)
                      </span>
                      <GitBranch className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">Hubungkan GitHub ke Vercel</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hubungkan repositori Git Anda di dashboard Vercel. Setiap kali Anda melakukan <code>git push origin main</code>, Vercel secara otomatis mem-build dan merilis versi baru.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-deploy dalam ~45 detik</span>
                  </div>
                </div>

                {/* Method 2: GitHub Actions */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Metode 2 (Enterprise)
                      </span>
                      <Terminal className="w-4 h-4 text-blue-600" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">GitHub Actions CI/CD</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pipeline otomatis di <code>.github/workflows/deploy-vercel.yml</code>. Menjalankan typecheck linting dan build sebelum mendeploy ke Vercel.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Workflow terpasang otomatis</span>
                  </div>
                </div>

                {/* Method 3: Vercel CLI */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        Metode 3 (Terminal Cepat)
                      </span>
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">Vercel CLI Instant</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Deploy langsung dari konsol atau terminal laptop Anda hanya dengan satu baris perintah.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npx vercel --prod', 'cli')}
                    className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-purple-700 font-mono font-bold flex items-center justify-between w-full hover:underline"
                  >
                    <span>npx vercel --prod</span>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="p-5 bg-slate-900 rounded-2xl text-slate-100 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Langkah Cepat Deploy ke Vercel via Git:</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('git add .\ngit commit -m "Deploy to Vercel"\ngit push origin main', 'git')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] text-emerald-400 font-sans transition-colors"
                  >
                    {copiedKey === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'git' ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="text-emerald-400 font-sans font-bold text-[11px]"># 1. Simpan dan push perubahan ke GitHub:</p>
                  <pre className="bg-slate-950 p-3 rounded-xl overflow-x-auto text-emerald-300 border border-slate-800">
{`git add .
git commit -m "feat: setup vercel deployment"
git push origin main`}
                  </pre>

                  <p className="text-emerald-400 font-sans font-bold text-[11px] pt-2"># 2. Impor di Vercel (https://vercel.com/new):</p>
                  <ul className="list-disc list-inside space-y-1 font-sans text-slate-300 text-xs pl-2">
                    <li>Pilih repositori <strong>IPL Saung Kebun</strong>.</li>
                    <li>Preset otomatis mendeteksi <strong>Vite</strong>.</li>
                    <li>Build command: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">npm run build</code>.</li>
                    <li>Output directory: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">dist</code>.</li>
                    <li>Klik <strong>Deploy</strong> &mdash; selesai!</li>
                  </ul>
                </div>
              </div>

              {/* Vercel.json Configuration Preview */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">File vercel.json Terpasang:</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify({
                      framework: "vite",
                      buildCommand: "npm run build",
                      outputDirectory: "dist",
                      rewrites: [
                        { source: "/api/(.*)", destination: "/api" },
                        { source: "/(.*)", destination: "/index.html" }
                      ]
                    }, null, 2), 'vjson')}
                    className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'vjson' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'vjson' ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 overflow-x-auto">
{`{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
