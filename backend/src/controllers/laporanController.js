import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const generateReport = async (req, res) => {
    const { reportType, startDate, endDate } = req.body;

    if (!reportType || !startDate || !endDate) {
        return res.status(400).json({ message: 'Tipe laporan dan rentang tanggal wajib diisi.' });
    }

    // Konversi tanggal ke format yang benar untuk Prisma
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();

    try {
        let data;
        if (reportType === 'surat_masuk') {
            data = await prisma.suratMasuk.findMany({
                where: {
                    tanggalMasuk: {
                        gte: start,
                        lte: end,
                    },
                },
                orderBy: {
                    tanggalMasuk: 'asc'
                },
                include: {
                    jenisSurat: true
                }
            });
        } else if (reportType === 'surat_keluar') {
            data = await prisma.suratKeluar.findMany({
                where: {
                    tanggalKeluar: {
                        gte: start,
                        lte: end,
                    },
                },
                orderBy: {
                    tanggalKeluar: 'asc'
                },
                include: {
                    jenisSurat: true
                }
            });
        } else {
            return res.status(400).json({ message: 'Tipe laporan tidak valid.' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data laporan.", error: error.message });
    }
};