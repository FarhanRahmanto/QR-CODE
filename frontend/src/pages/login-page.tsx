import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Loader2, ArrowLeft, Smartphone, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('628123456789');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Masukkan nomor WhatsApp');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authService.requestOTP(phone);
      setStep('otp');
      toast.success('Kode OTP telah dikirim ke WhatsApp Anda');
      if (res.devCode) {
        setOtp(res.devCode);
        toast.info(`Mode pengembangan: kode OTP Anda ${res.devCode}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Masukkan kode OTP');
      return;
    }
    setIsLoading(true);
    try {
      await login({ mode: 'phone', phone, otp });
      toast.success('Berhasil masuk ke Dashboard!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Kode OTP salah'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Email dan kata sandi wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      await login({ mode: 'email', email, password });
      toast.success('Selamat datang kembali!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal masuk dengan email'));
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
              Masuk untuk memantau status barang & laporan penemuan
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/50">
            <button
              type="button"
              onClick={() => {
                setMode('phone');
                setStep('phone');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'phone'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              WhatsApp OTP
            </button>
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'email'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email & Sandi
            </button>
          </div>

          {/* Content based on Mode */}
          {mode === 'phone' ? (
            step === 'phone' ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80">
                    Nomor WhatsApp Terdaftar
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="628123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 rounded-xl pl-3 pr-10 border-border/70 focus-visible:ring-primary"
                    />
                    <Smartphone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Kode OTP instan akan dikirimkan ke WhatsApp Anda.
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Kode OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLoginPhone} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs font-semibold text-foreground/80">
                    Kode Verifikasi OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="h-12 text-center text-xl tracking-[0.3em] font-mono rounded-xl border-border/70"
                  />
                  <p className="text-[11px] text-center text-muted-foreground">
                    Masukkan 6 digit kode yang dikirim ke <span className="font-semibold text-foreground">{phone}</span>
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verifikasi & Masuk
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('phone')}
                  className="w-full rounded-xl text-xs h-9"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Ganti Nomor WhatsApp
                </Button>
              </form>
            )
          ) : (
            <form onSubmit={handleLoginEmail} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pl-3 pr-10 border-border/70"
                  />
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk dengan Email
              </Button>
            </form>
          )}

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
