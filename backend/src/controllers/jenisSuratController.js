import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAll = async (req, res) => {
    try {
        const data = await prisma.jenisSurat.findMany({ orderBy: { nama: 'asc' } });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data', error: error.message });
    }
};

export const create = async (req, res) => {
    const { nama, deskripsi } = req.body;
    try {
        const newData = await prisma.jenisSurat.create({ data: { nama, deskripsi } });
        res.status(201).json(newData);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Nama jenis surat sudah ada.' });
        }
        res.status(400).json({ message: 'Gagal membuat data', error: error.message });
    }
};

export const update = async (req, res) => {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    try {
        const updatedData = await prisma.jenisSurat.update({
            where: { id },
            data: { nama, deskripsi },
        });
        res.json(updatedData);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Nama jenis surat sudah ada.' });
        }
        res.status(400).json({ message: 'Gagal update data', error: error.message });
    }
};

export const remove = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.jenisSurat.delete({ where: { id } });
        res.json({ message: 'Data berhasil dihapus' });
    } catch (error) {
        // Error jika jenis surat masih digunakan
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Jenis surat tidak bisa dihapus karena masih digunakan oleh surat masuk/keluar.' });
        }
        res.status(500).json({ message: 'Gagal menghapus data', error: error.message });
    }
};