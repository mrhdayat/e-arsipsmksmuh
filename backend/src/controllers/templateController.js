import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fungsi bantuan untuk mengekstrak placeholder unik dari teks
const extractPlaceholders = (text) => {
    if (!text) return [];
    const regex = /{{\s*(\w+)\s*}}/g;
    const matches = text.match(regex) || [];
    const uniquePlaceholders = [...new Set(matches.map(p => p.replace(/{{\s*|\s*}}/g, '')))];
    return uniquePlaceholders;
};

export const getAllTemplates = async (req, res) => {
    try {
        const templates = await prisma.templateSurat.findMany({ orderBy: { nama: 'asc' } });
        // Ubah kembali string JSON ke array sebelum dikirim ke frontend
        const templatesWithParsedPlaceholders = templates.map(t => ({
            ...t,
            placeholders: JSON.parse(t.placeholders)
        }));
        res.json(templatesWithParsedPlaceholders);
    } catch (error) { res.status(500).json({ message: 'Gagal mengambil template.' }); }
};

export const createTemplate = async (req, res) => {
    const { nama, subjek, isi } = req.body;
    try {
        const placeholdersArray = extractPlaceholders(isi);
        // Ubah array menjadi string JSON sebelum disimpan
        const placeholdersJson = JSON.stringify(placeholdersArray);

        const template = await prisma.templateSurat.create({ 
            data: { nama, subjek, isi, placeholders: placeholdersJson } 
        });
        res.status(201).json(template);
    } catch (error) { res.status(400).json({ message: 'Gagal membuat template.' }); }
};

export const updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { nama, subjek, isi } = req.body;
    try {
        const placeholdersArray = extractPlaceholders(isi);
        // Ubah array menjadi string JSON sebelum disimpan
        const placeholdersJson = JSON.stringify(placeholdersArray);

        const template = await prisma.templateSurat.update({ 
            where: { id }, 
            data: { nama, subjek, isi, placeholders: placeholdersJson } 
        });
        res.json(template);
    } catch (error) { res.status(400).json({ message: 'Gagal memperbarui template.' }); }
};

export const deleteTemplate = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.templateSurat.delete({ where: { id } });
        res.json({ message: 'Template berhasil dihapus.' });
    } catch (error) { res.status(500).json({ message: 'Gagal menghapus template.' }); }
};