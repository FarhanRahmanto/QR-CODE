import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { QrCode, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <QrCode className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground max-w-sm mb-6 text-sm">
        Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau kodenya salah.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Link>
      </Button>
    </div>
  );
}

