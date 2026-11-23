import { Outlet, Link } from 'react-router';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { QrCode } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-6xl">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <QrCode className="h-6 w-6" />
            <span>TemuBarang</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="container mx-auto px-4">
          <p>© 2026 TemuBarang. Platform Barang Hilang Berbasis Stiker QR & Barcode.</p>
        </div>
      </footer>
    </div>
  );
}

