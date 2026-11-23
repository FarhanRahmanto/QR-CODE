import { Routes, Route } from 'react-router';
import { PublicLayout } from '@/components/layout/public-layout';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';

import { LandingPage } from '@/pages/landing-page';
import { LoginPage } from '@/pages/login-page';
import { RegisterPage } from '@/pages/register-page';
import { ScanPublicPage } from '@/pages/scan-public-page';

import { DashboardPage } from '@/pages/dashboard-page';
import { ItemNewPage } from '@/pages/item-new-page';
import { ItemEditPage } from '@/pages/item-edit-page';
import { ItemDetailPage } from '@/pages/item-detail-page';
import { SettingsPage } from '@/pages/settings-page';
import { NotFoundPage } from '@/pages/not-found-page';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Public Scan Page (Mobile-first standalone scanner page) */}
      <Route path="/s/:code" element={<ScanPublicPage />} />
      <Route path="/scan/:code" element={<ScanPublicPage />} />

      {/* Protected Dashboard Pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/items/new" element={<ItemNewPage />} />
          <Route path="/items/:id/edit" element={<ItemEditPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

