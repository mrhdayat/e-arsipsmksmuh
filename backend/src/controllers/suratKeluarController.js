import { PrismaClient } from '@prisma/client';
import { generatePdfFromHtml } from '../services/pdfGeneratorService.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const __dirname = path.resolve();

const deleteFile = (fileUrl) => {
    if (!fileUrl) return;
    const filePath = path.join(__dirname, fileUrl);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); console.log(`File berhasil dihapus: ${filePath}`); }
        catch (err) { console.error(`Gagal menghapus file: ${err.message}`); }
    } else {
        console.warn(`File tidak ditemukan, tidak jadi dihapus: ${filePath}`);
    }
};

export const getAll = async (req, res) => {
  const { startDate, endDate, jenisSuratId } = req.query;
  const whereClause = { AND: [] };

  if (startDate && endDate) {
    whereClause.AND.push({
      tanggalKeluar: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }
  if (jenisSuratId) {
    whereClause.AND.push({ jenisSuratId: jenisSuratId });
  }

  try {
    const data = await prisma.suratKeluar.findMany({
      where: whereClause,
      include: { jenisSurat: true },
      orderBy: { tanggalKeluar: 'desc' },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data surat keluar', error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await prisma.suratKeluar.findUnique({ where: { id: req.params.id }, include: { jenisSurat: true } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data', error: error.message });
  }
};

export const create = async (req, res) => {
  const { nomorAgenda, nomorSurat, tanggalKeluar, tujuan, perihal, isi, jenisSuratId } = req.body;
  try {
    const generatedFileUrl = await generatePdfFromHtml(isi);
    const newData = await prisma.suratKeluar.create({
      data: {
        nomorAgenda, nomorSurat, tanggalKeluar: new Date(tanggalKeluar), tujuan,
        perihal, isi, jenisSuratId, fileUrl: generatedFileUrl,
      },
    });
    await prisma.auditLog.create({
        data: {
            userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
            action: 'GENERATE_SURAT_KELUAR',
            details: `Membuat & Generate PDF Surat Keluar No. Agenda: ${newData.nomorAgenda}`
        }
    });
    res.status(201).json(newData);
  } catch (error) {
    console.error("Error di create surat keluar:", error);
    res.status(500).json({ message: 'Gagal membuat surat keluar.', error: error.message });
  }
};

export const update = async (req, res) => {
    const { id } = req.params;
    const { nomorAgenda, nomorSurat, tanggalKeluar, tujuan, perihal, isi, jenisSuratId } = req.body;
    
    try {
        // 1. Ambil data surat yang ada untuk mendapatkan path file lama
        const existingSurat = await prisma.suratKeluar.findUnique({ where: { id } });
        if (!existingSurat) return res.status(404).json({ message: 'Data tidak ditemukan' });

        // 2. Hapus file PDF lama dari server
        deleteFile(existingSurat.fileUrl);

        // 3. Generate PDF baru dari isi yang diperbarui
        const newGeneratedFileUrl = await generatePdfFromHtml(isi);

        // 4. Update data di database dengan semua info baru, termasuk fileUrl baru
        const updatedData = await prisma.suratKeluar.update({
            where: { id },
            data: {
                nomorAgenda, nomorSurat, tanggalKeluar: new Date(tanggalKeluar), tujuan,
                perihal, isi, jenisSuratId,
                fileUrl: newGeneratedFileUrl, // Gunakan path PDF yang baru
            },
        });

        // 5. Logging
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
                action: 'UPDATE_SURAT_KELUAR',
                details: `Memperbarui & re-generate PDF surat keluar ID: ${id}`
            }
        });

        res.json(updatedData);
    } catch (error) {
        console.error("Error di update surat keluar:", error);
        res.status(400).json({ message: 'Gagal update data', error: error.message });
    }
};

export const remove = async (req, res) => {
  try {
    const surat = await prisma.suratKeluar.findUnique({ where: { id: req.params.id } });
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan.' });
    await prisma.suratKeluar.delete({ where: { id: req.params.id } });
    deleteFile(surat.fileUrl);
    await prisma.auditLog.create({
        data: {
            userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
            action: 'DELETE_SURAT_KELUAR',
            details: `Menghapus surat keluar "${surat.perihal}" (ID: ${surat.id})`
        }
    });
    res.json({ message: 'Data surat dan file fisik berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data', error: error.message });
  }
};

export const bulkDelete = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "ID surat tidak valid atau kosong." });
    }
    try {
        const suratsToDelete = await prisma.suratKeluar.findMany({ where: { id: { in: ids } }, select: { fileUrl: true } });
        const deleteResult = await prisma.suratKeluar.deleteMany({ where: { id: { in: ids } } });
        for (const surat of suratsToDelete) {
            deleteFile(surat.fileUrl);
        }
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
                action: 'BULK_DELETE_SURAT_KELUAR',
                details: `Menghapus ${deleteResult.count} surat keluar. IDs: ${ids.join(', ')}`
            }
        });
        res.json({ message: `${deleteResult.count} surat dan file terkait berhasil dihapus.` });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus surat secara massal.', error: error.message });
    }
};