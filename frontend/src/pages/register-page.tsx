import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { QrCode, Loader2, Smartphone, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim()) {
      toast.error('Nomor WhatsApp wajib diisi (untuk menerima laporan)');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        name,
        phone,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
      });
      toast.success('Pendaftaran berhasil! Akun Anda siap digunakan.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Pendaftaran gagal. Silakan coba kembali.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative z-10 transition-all">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent text-primary shadow-inner mb-1">
              <QrCode className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daftar Akun Baru</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Satu akun untuk mencetak dan mengelola seluruh stiker QR barang Anda
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground/80">
                Nama Lengkap *
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  required
                />
                <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80">
                  Nomor WhatsApp *
                </Label>
                <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded-full bg-primary/10">
                  Wajib untuk Notifikasi
                </span>
              </div>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="628xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  required
                />
                <Smartphone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tersimpan di akun Anda, tidak perlu dimasukkan berulang saat membuat barang.
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-4">
              <p className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wider">
                Opsi Login Tambahan (Opsional)
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com (opsional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  />
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  />
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md mt-2">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Masuk di sini
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
