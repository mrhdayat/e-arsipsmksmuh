#  Manajemen Surat Muhammadiyah

Aplikasi berbasis web yang dirancang untuk membantu organisasi Muhammadiyah dalam mengelola, melacak, dan mengarsipkan surat masuk dan surat keluar secara efisien.

## ✨ Fitur Utama

- **Otentikasi Pengguna**: Sistem login yang aman dengan peran pengguna (misalnya, Admin, Kepala Sekolah, Staf).
- **Dashboard Interaktif**: Menampilkan statistik kunci seperti jumlah total surat masuk, surat keluar, dan ringkasan aktivitas terbaru.
- **Manajemen Surat Masuk**:
  - Pencatatan surat masuk beserta detailnya (nomor, tanggal, pengirim, perihal).
  - Unggah dan simpan pindaian (scan) dokumen surat.
- **Manajemen Surat Keluar**:
  - Pembuatan surat keluar menggunakan template yang telah disediakan.
  - Penomoran surat otomatis.
  - Menghasilkan file PDF dari surat yang dibuat.
- **Template Surat**: Kelola template surat untuk mempercepat proses pembuatan surat keluar.
- **Laporan**: Hasilkan laporan periodik untuk surat masuk dan keluar.
- **Log Audit**: Melacak semua aktivitas penting yang terjadi di dalam sistem untuk tujuan akuntabilitas.

## 🛠️ Teknologi yang Digunakan

### Backend
- **Node.js**: Lingkungan eksekusi JavaScript di sisi server.
- **Express.js**: Kerangka kerja web untuk membangun API.
- **Prisma**: ORM (Object-Relational Mapping) modern untuk berinteraksi dengan database.
- **SQLite**: Database relasional yang ringan dan berbasis file.
- **JSON Web Tokens (JWT)**: Untuk otentikasi yang aman.
- **Multer**: Middleware untuk menangani unggahan file.

### Frontend
- **React**: Pustaka JavaScript untuk membangun antarmuka pengguna.
- **Vite**: Alat build modern yang sangat cepat untuk pengembangan frontend.
- **React Router**: Untuk routing di sisi klien.
- **Axios**: Klien HTTP berbasis Promise untuk membuat permintaan ke backend.
- **CSS**: Styling kustom untuk antarmuka yang bersih dan responsif.

## 🚀 Instalasi dan Konfigurasi

Ikuti langkah-langkah ini untuk menjalankan aplikasi di lingkungan lokal Anda.

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih tinggi)
- npm (biasanya terinstal bersama Node.js)

### 1. Clone Repositori
```bash
git clone https://github.com/username/manajemen-surat-muhammadiyah.git
cd manajemen-surat-muhammadiyah
```

### 2. Konfigurasi Backend
```bash
# Masuk ke direktori backend
cd backend

# Instal dependensi
npm install

# Buat file .env dari contoh
# Anda bisa menyalin konten di bawah ini ke dalam file .env baru
```
**Isi file `backend/.env`:**
```env
# URL koneksi database untuk Prisma (menggunakan SQLite)
DATABASE_URL="file:./dev.db"

# Kunci rahasia untuk menandatangani token JWT
JWT_SECRET="ganti-dengan-kunci-rahasia-anda-yang-kuat"
```
```bash
# Jalankan migrasi database untuk membuat skema
npx prisma migrate dev

# Jalankan server backend
npm start
```
Server backend sekarang akan berjalan di `http://localhost:5000`.

### 3. Konfigurasi Frontend
```bash
# Buka terminal baru atau kembali ke direktori root, lalu masuk ke direktori frontend
cd ../frontend

# Instal dependensi
npm install

# Buat file .env.local dari contoh
# Anda bisa menyalin konten di bawah ini ke dalam file .env.local baru
```
**Isi file `frontend/.env.local`:**
```env
# URL dasar untuk API backend Anda
VITE_API_BASE_URL="http://localhost:5000/api"
```
```bash
# Jalankan server development frontend
npm run dev
```
Aplikasi frontend sekarang dapat diakses di `http://localhost:5173` (atau port lain yang ditampilkan oleh Vite).

## 📖 Cara Penggunaan

1.  Buka browser dan akses alamat frontend (`http://localhost:5173`).
2.  Anda akan diarahkan ke halaman login.
3.  Gunakan kredensial default (jika ada) atau daftar sebagai pengguna baru untuk mulai menggunakan aplikasi.
4.  Jelajahi berbagai menu seperti Dashboard, Surat Masuk, dan Surat Keluar untuk mengelola surat.

## 🤝 Kontribusi

Kontribusi sangat diterima! Jika Anda ingin berkontribusi, silakan fork repositori ini, buat branch baru untuk fitur atau perbaikan Anda, dan ajukan *Pull Request*.

1.  Fork repositori ini.
2.  Buat branch baru (`git checkout -b fitur/nama-fitur-baru`).
3.  Lakukan perubahan dan commit (`git commit -m 'Menambahkan fitur baru'`).
4.  Push ke branch Anda (`git push origin fitur/nama-fitur-baru`).
5.  Buka Pull Request.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).
