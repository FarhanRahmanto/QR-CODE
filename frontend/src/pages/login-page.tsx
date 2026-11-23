import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { QrCode, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Email dan kata sandi wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Selamat datang kembali!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal masuk. Periksa email dan kata sandi Anda.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Decorative ambient glow background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative z-10 transition-all">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent text-primary shadow-inner mb-1">
              <QrCode className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Selamat Datang</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Masuk untuk memantau status barang &amp; laporan penemuan
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                Alamat Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  required
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 text-muted-foreground/70 hover:text-foreground"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Masuk
            </Button>
          </form>

          <div className="rounded-2xl bg-muted/50 border border-border/50 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Akun demo:</span> budi.santoso@example.com /
            password123
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground">
            Belum memiliki akun?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
