import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // a.l. { userId, role, name }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid, otorisasi gagal' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token, otorisasi gagal' });
  }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN_TU') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, hanya untuk Admin TU' });
    }
};