import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
    try {
        const totalSuratMasuk = await prisma.suratMasuk.count();
        const totalSuratKeluar = await prisma.suratKeluar.count();

        const today = dayjs().endOf('day').toDate();
        const startOfMonth = dayjs().startOf('month').toDate();

        const suratMasukBulanIni = await prisma.suratMasuk.count({
            where: {
                tanggalMasuk: {
                    gte: startOfMonth,
                    lte: today,
                }
            }
        });
        
        const suratKeluarBulanIni = await prisma.suratKeluar.count({
            where: {
                tanggalKeluar: {
                    gte: startOfMonth,
                    lte: today,
                }
            }
        });

        // Statistik untuk grafik (contoh 6 bulan terakhir)
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
            const date = dayjs().subtract(i, 'month');
            const start = date.startOf('month').toDate();
            const end = date.endOf('month').toDate();

            const masuk = await prisma.suratMasuk.count({
                where: { tanggalMasuk: { gte: start, lte: end } }
            });
            const keluar = await prisma.suratKeluar.count({
                where: { tanggalKeluar: { gte: start, lte: end } }
            });

            monthlyStats.push({
                name: date.format('MMM'),
                'Surat Masuk': masuk,
                'Surat Keluar': keluar,
            });
        }
        
        res.json({
            totalSuratMasuk,
            totalSuratKeluar,
            suratMasukBulanIni,
            suratKeluarBulanIni,
            monthlyStats,
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const recentMasuk = await prisma.suratMasuk.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, perihal: true, pengirim: true, createdAt: true }
        });

        const recentKeluar = await prisma.suratKeluar.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, perihal: true, tujuan: true, createdAt: true }
        });

        res.json({ recentMasuk, recentKeluar });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil aktivitas terbaru', error: error.message });
    }
};