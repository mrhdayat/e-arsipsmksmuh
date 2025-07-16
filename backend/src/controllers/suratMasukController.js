import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
      tanggalMasuk: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }
  if (jenisSuratId) {
    whereClause.AND.push({ jenisSuratId: jenisSuratId });
  }

  try {
    const data = await prisma.suratMasuk.findMany({
      where: whereClause,
      include: { jenisSurat: true },
      orderBy: { tanggalMasuk: 'desc' },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data surat masuk', error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await prisma.suratMasuk.findUnique({ where: { id: req.params.id }, include: { jenisSurat: true } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data', error: error.message });
  }
};

export const create = async (req, res) => {
  const { nomorAgenda, nomorSurat, tanggalMasuk, tanggalSurat, pengirim, perihal, jenisSuratId } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  if (!fileUrl) return res.status(400).json({ message: "File surat wajib diupload." });

  try {
    const newData = await prisma.suratMasuk.create({
      data: {
        nomorAgenda, nomorSurat, tanggalMasuk: new Date(tanggalMasuk), tanggalSurat: new Date(tanggalSurat),
        pengirim, perihal, fileUrl, jenisSurat: { connect: { id: jenisSuratId } },
      },
    });
    await prisma.auditLog.create({
        data: {
            userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
            action: 'CREATE_SURAT_MASUK',
            details: `Membuat surat masuk baru dengan No. Agenda: ${newData.nomorAgenda}`
        }
    });
    res.status(201).json(newData);
  } catch (error) {
    deleteFile(fileUrl);
    if (error.code === 'P2002') return res.status(400).json({ message: 'Nomor Agenda sudah ada.' });
    res.status(400).json({ message: 'Gagal membuat data', error: error.message });
  }
};

export const update = async (req, res) => {
    const { id } = req.params;
    const { nomorAgenda, nomorSurat, tanggalMasuk, tanggalSurat, pengirim, perihal, jenisSuratId } = req.body;
    try {
        const existingSurat = await prisma.suratMasuk.findUnique({ where: { id } });
        if (!existingSurat) return res.status(404).json({ message: 'Data tidak ditemukan' });
        let fileUrl = existingSurat.fileUrl;
        if (req.file) {
            deleteFile(existingSurat.fileUrl);
            fileUrl = `/uploads/${req.file.filename}`;
        }
        const updatedData = await prisma.suratMasuk.update({
            where: { id },
            data: {
                nomorAgenda, nomorSurat, tanggalMasuk: new Date(tanggalMasuk), tanggalSurat: new Date(tanggalSurat),
                pengirim, perihal, fileUrl, jenisSurat: { connect: { id: jenisSuratId } },
            },
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
                action: 'UPDATE_SURAT_MASUK',
                details: `Memperbarui surat masuk dengan ID: ${id}`
            }
        });
        res.json(updatedData);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ message: 'Nomor Agenda sudah ada.' });
        res.status(400).json({ message: 'Gagal update data', error: error.message });
    }
};

export const remove = async (req, res) => {
  try {
    const surat = await prisma.suratMasuk.findUnique({ where: { id: req.params.id } });
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan.' });
    await prisma.suratMasuk.delete({ where: { id: req.params.id } });
    deleteFile(surat.fileUrl);
    await prisma.auditLog.create({
        data: {
            userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
            action: 'DELETE_SURAT_MASUK',
            details: `Menghapus surat masuk "${surat.perihal}" (ID: ${surat.id})`
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
        const suratsToDelete = await prisma.suratMasuk.findMany({ where: { id: { in: ids } }, select: { fileUrl: true } });
        const deleteResult = await prisma.suratMasuk.deleteMany({ where: { id: { in: ids } } });
        for (const surat of suratsToDelete) {
            deleteFile(surat.fileUrl);
        }
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
                action: 'BULK_DELETE_SURAT_MASUK',
                details: `Menghapus ${deleteResult.count} surat masuk. IDs: ${ids.join(', ')}`
            }
        });
        res.json({ message: `${deleteResult.count} surat dan file terkait berhasil dihapus.` });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus surat secara massal.', error: error.message });
    }
};