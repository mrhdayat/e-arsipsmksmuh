import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SuratMasukPage from './pages/SuratMasukPage';
import SuratKeluarPage from './pages/SuratKeluarPage';
import PengaturanPage from './pages/PengaturanPage';
import NotFoundPage from './pages/NotFoundPage';
import LaporanPage from './pages/LaporanPage';
import AuditLogPage from './pages/AuditLogPage';
import TemplateSuratPage from './pages/TemplateSuratPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="surat-masuk" element={<SuratMasukPage />} />
        <Route path="surat-keluar" element={<SuratKeluarPage />} />
        <Route path="laporan" element={<LaporanPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="template-surat" element={<TemplateSuratPage />} />
        <Route path="pengaturan" element={<PengaturanPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;