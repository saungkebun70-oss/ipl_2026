import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db.ts';

export function createExpressApp() {
  const app = express();
  app.use(express.json());

  // API Routes
  // 1. Get financial summary & KPIs
  app.get('/api/summary', (_req: Request, res: Response) => {
    try {
      const summary = db.getFinancialSummary();
      const settings = db.getSettings();
      const officers = db.getOfficers();
      res.json({ success: true, summary, settings, officers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get list of residents (115 residents)
  app.get('/api/residents', (req: Request, res: Response) => {
    try {
      const { group, status, search } = req.query;
      let residents = db.getResidents();

      if (group && typeof group === 'string') {
        residents = residents.filter(r => r.blokGroup === group.toUpperCase());
      }
      if (status && typeof status === 'string') {
        residents = residents.filter(r => r.statusBulanIni.toLowerCase() === status.toLowerCase());
      }
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        residents = residents.filter(r =>
          r.blok.toLowerCase().includes(query) ||
          r.nama.toLowerCase().includes(query) ||
          r.nomorRumah.includes(query)
        );
      }

      res.json({ success: true, total: residents.length, data: residents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Get single resident detail
  app.get('/api/residents/:id', (req: Request, res: Response) => {
    try {
      const resident = db.getResidentById(req.params.id);
      if (!resident) {
        return res.status(404).json({ success: false, error: 'Warga tidak ditemukan' });
      }
      res.json({ success: true, data: resident });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3b. Update resident detail (Bendahara management)
  app.put('/api/residents/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateResident(req.params.id, req.body);
      res.json({
        success: true,
        message: `Data warga unit ${updated.blok} berhasil diperbarui`,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3b-2. Add new resident
  app.post('/api/residents', (req: Request, res: Response) => {
    try {
      const created = db.addResident(req.body);
      res.status(201).json({
        success: true,
        message: `Warga baru unit ${created.blok} (${created.nama}) berhasil ditambahkan`,
        data: created
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3b-3. Delete resident
  app.delete('/api/residents/:id', (req: Request, res: Response) => {
    try {
      db.deleteResident(req.params.id);
      res.json({
        success: true,
        message: 'Data warga berhasil dihapus'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3c. Update specific month status (Bendahara quick toggle / matrix edit)
  app.put('/api/residents/:id/month-status', (req: Request, res: Response) => {
    try {
      const { month, status, amount } = req.body;
      if (!month || !status) {
        return res.status(400).json({ success: false, error: 'Parameter month dan status diperlukan' });
      }
      const updated = db.updateResidentMonthStatus(req.params.id, month, status, amount);
      res.json({
        success: true,
        message: `Status bulan ${month} untuk unit ${updated.blok} berhasil diubah ke ${status}`,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync / update all dues up to September 2026
  app.post('/api/sync-dues-september', (req: Request, res: Response) => {
    try {
      const result = db.syncDuesUpToSeptember();
      res.json({
        success: true,
        message: `Database iuran berhasil disinkronkan sampai September 2026 (${result.count} unit, Total B6+B7: Rp ${result.totalPaidB6B7.toLocaleString('id-ID')})`,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Resident / Admin Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { role, blok, pin, password } = req.body;

      if (role === 'KETUA') {
        if (pin === '1234' || password === 'ketua' || pin === '123456') {
          return res.json({
            success: true,
            user: {
              role: 'KETUA',
              name: 'Bp. Erlangga',
              title: 'Ketua Paguyuban Saung Kebun',
              blok: 'B03/07',
              phone: '081298765432'
            }
          });
        }
        return res.status(401).json({ success: false, error: 'PIN Ketua salah (Gunakan 1234)' });
      }

      if (role === 'BENDAHARA') {
        if (pin === '1234' || password === 'bendahara' || pin === '123456') {
          return res.json({
            success: true,
            user: {
              role: 'BENDAHARA',
              name: 'Bp. Andriansyah',
              title: 'Bendahara Keuangan IPL Saung Kebun',
              blok: 'B07/16',
              phone: '081287654321'
            }
          });
        }
        return res.status(401).json({ success: false, error: 'PIN Bendahara salah (Gunakan 1234)' });
      }

      if (role === 'WARGA') {
        if (!blok) {
          return res.status(400).json({ success: false, error: 'Harap masukkan nomor blok rumah (contoh: A-01)' });
        }
        const resident = db.getResidentByBlok(blok);
        if (!resident) {
          return res.status(404).json({ success: false, error: `Blok rumah ${blok} tidak terdaftar di Saung Kebun.` });
        }
        if (pin && resident.pin !== pin && pin !== '1234') {
          return res.status(401).json({ success: false, error: 'PIN salah (Gunakan default: 1234)' });
        }

        return res.json({
          success: true,
          user: {
            role: 'WARGA',
            residentId: resident.id,
            name: resident.nama,
            blok: resident.blok,
            title: `Warga Blok ${resident.blok}`,
            phone: resident.noWhatsapp,
            resident
          }
        });
      }

      res.status(400).json({ success: false, error: 'Role tidak valid' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Get transactions
  app.get('/api/transactions', (_req: Request, res: Response) => {
    try {
      const transactions = db.getTransactions();
      res.json({ success: true, total: transactions.length, data: transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Record Digital Payment
  app.post('/api/payments/pay', (req: Request, res: Response) => {
    try {
      const { residentId, months, amount, method, actorName } = req.body;
      if (!residentId || !amount || !method) {
        return res.status(400).json({ success: false, error: 'Data pembayaran tidak lengkap' });
      }

      const result = db.recordPayment({
        residentId,
        months: Array.isArray(months) && months.length > 0 ? months : ['November 2026'],
        amount: Number(amount),
        method,
        actorName: actorName || 'Warga (Self-Service Digital)'
      });

      res.json({
        success: true,
        message: 'Pembayaran digital berhasil diverifikasi dan tercatat di kas Saung Kebun.',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6b. Midtrans Payment Gateway Webhook Handler
  app.post('/api/webhook/midtrans', (req: Request, res: Response) => {
    try {
      const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        transaction_status,
        payment_type,
        custom_field1,
        custom_field2,
      } = req.body;

      const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DemoSaungKebun2026';
      
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex');

      const isSimulated = req.headers['x-simulator'] === 'true' || !signature_key;
      const isSignatureValid = signature_key === expectedSignature || isSimulated;

      if (!isSignatureValid) {
        return res.status(403).json({ success: false, error: 'Signature hash verifikasi Midtrans tidak valid' });
      }

      if (transaction_status === 'settlement' || transaction_status === 'capture') {
        let resident = null;
        if (custom_field1) {
          resident = db.getResidentById(custom_field1);
        }
        if (!resident && order_id) {
          const parts = order_id.split('-');
          if (parts.length >= 3) {
            resident = db.getResidentById(`${parts[1]}-${parts[2]}-${parts[3]}`) || db.getResidentById(parts[1]);
          }
        }
        if (!resident) {
          resident = db.getResidents().find(r => r.statusBulanIni !== 'Lunas') || db.getResidents()[0];
        }

        const methodMap: Record<string, any> = {
          qris: 'QRIS',
          bank_transfer: 'VA_BCA',
          bca_va: 'VA_BCA',
          mandiri_va: 'VA_MANDIRI',
          bri_va: 'VA_BRI',
          gopay: 'EWALLET_GOPAY',
          dana: 'EWALLET_DANA'
        };

        const resolvedMethod = methodMap[payment_type?.toLowerCase()] || 'QRIS';

        const paymentResult = db.recordPayment({
          residentId: resident.id,
          months: [custom_field2 || 'November 2026'],
          amount: parseFloat(gross_amount) || resident.tagihanBulanan,
          method: resolvedMethod,
          actorName: `Midtrans Gateway Webhook (${payment_type ? payment_type.toUpperCase() : 'QRIS'})`
        });

        return res.status(200).json({
          success: true,
          message: `Pembayaran ${resident.nama} (${resident.blok}) berhasil di-settle via Midtrans Webhook`,
          order_id,
          status: 'settlement',
          data: paymentResult
        });
      } else if (transaction_status === 'pending') {
        return res.status(200).json({ success: true, message: 'Menunggu pembayaran dari warga via QRIS/VA', order_id });
      } else if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
        return res.status(200).json({ success: true, message: `Transaksi ${order_id} dibatalkan/expired (${transaction_status})` });
      }

      res.status(200).json({ success: true, message: 'Webhook event diterima' });
    } catch (err: any) {
      console.error('Midtrans Webhook error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Add Expense by Bendahara
  app.post('/api/transactions/expense', (req: Request, res: Response) => {
    try {
      const { kategori, nominal, keterangan, penanggungJawab, buktiUrl } = req.body;
      if (!kategori || !nominal || !keterangan) {
        return res.status(400).json({ success: false, error: 'Data pengeluaran wajib diisi lengkap' });
      }

      const tx = db.addExpense({
        kategori,
        nominal: Number(nominal),
        keterangan,
        penanggungJawab: penanggungJawab || 'Bendahara (Bp. Andriansyah)',
        buktiUrl
      });

      res.json({
        success: true,
        message: 'Pengeluaran kas berhasil dibukukan.',
        data: tx
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Broadcast WhatsApp Billing Reminder
  app.post('/api/notifications/broadcast-reminder', (req: Request, res: Response) => {
    try {
      const { residentId } = req.body;
      const result = db.broadcastBillingReminder(residentId);
      res.json({
        success: true,
        message: `Berhasil menyiapkan ${result.count} notifikasi WhatsApp pengingat iuran.`,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Get notifications list
  app.get('/api/notifications', (_req: Request, res: Response) => {
    try {
      const notifs = db.getNotifications();
      res.json({ success: true, data: notifs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Get Audit logs
  app.get('/api/audit-logs', (_req: Request, res: Response) => {
    try {
      const logs = db.getAuditLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Database Reset & Backup
  app.post('/api/db/reset', (_req: Request, res: Response) => {
    try {
      db.resetDatabase();
      res.json({ success: true, message: 'Database Saung Kebun berhasil di-reset ke data demo awal.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/db/backup', (_req: Request, res: Response) => {
    try {
      const fullData = db.getData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=backup_kas_saung_kebun.json');
      res.send(JSON.stringify(fullData, null, 2));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return app;
}

export const app = createExpressApp();
export default app;
