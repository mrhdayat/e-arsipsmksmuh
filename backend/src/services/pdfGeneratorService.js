import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();

export const generatePdfFromHtml = async (htmlContent, kopSuratPath = null) => {
    // Pastikan folder uploads ada
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    // Gabungkan HTML dengan Kop Surat jika ada
    let finalHtml = htmlContent;
    if (kopSuratPath && fs.existsSync(kopSuratPath)) {
        const kopSuratBase64 = fs.readFileSync(kopSuratPath, 'base64');
        const kopSuratHtml = `<img src="data:image/jpeg;base64,${kopSuratBase64}" style="width: 100%;" /> <hr/>`;
        finalHtml = kopSuratHtml + htmlContent;
    }
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Opsi agar kompatibel di banyak server
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    const fileName = `surat-keluar-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
    });

    await browser.close();

    // Kembalikan path relatif untuk disimpan di database
    return `/uploads/${fileName}`;
};