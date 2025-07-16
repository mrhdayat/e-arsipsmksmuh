-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SuratMasuk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorAgenda" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalMasuk" DATETIME NOT NULL,
    "tanggalSurat" DATETIME NOT NULL,
    "pengirim" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "jenisSuratId" TEXT NOT NULL,
    CONSTRAINT "SuratMasuk_jenisSuratId_fkey" FOREIGN KEY ("jenisSuratId") REFERENCES "JenisSurat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SuratKeluar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorAgenda" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalKeluar" DATETIME NOT NULL,
    "tujuan" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "isi" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "jenisSuratId" TEXT NOT NULL,
    CONSTRAINT "SuratKeluar_jenisSuratId_fkey" FOREIGN KEY ("jenisSuratId") REFERENCES "JenisSurat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JenisSurat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT
);

-- CreateTable
CREATE TABLE "TemplateSurat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "subjek" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "placeholders" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuratMasuk_nomorAgenda_key" ON "SuratMasuk"("nomorAgenda");

-- CreateIndex
CREATE UNIQUE INDEX "SuratKeluar_nomorAgenda_key" ON "SuratKeluar"("nomorAgenda");

-- CreateIndex
CREATE UNIQUE INDEX "JenisSurat_nama_key" ON "JenisSurat"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSurat_nama_key" ON "TemplateSurat"("nama");
