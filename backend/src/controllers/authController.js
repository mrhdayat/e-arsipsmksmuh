import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ message: "Username, password, dan nama wajib diisi." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role },
    });
    // Jangan kirim password kembali
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: 'User berhasil dibuat', user: userWithoutPassword });
  } catch (error) {
    if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Username sudah digunakan.' });
    }
    res.status(500).json({ message: 'Gagal membuat user', error: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Username atau password salah' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    // --- MULAI LOGGING ---
    // Catat aksi login ke AuditLog
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: 'USER_LOGIN',
            details: `Pengguna ${user.name} berhasil login.`
        }
    });
    // --- AKHIR LOGGING ---

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};