import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: {
                timestamp: 'desc' // Tampilkan yang terbaru di atas
            },
            take: 200, // Batasi 200 log terbaru agar tidak berat
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data log.", error: error.message });
    }
};