import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, Sun, Moon, Trash2, ShieldAlert, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const normalize = (p: string) => {
  const d = p.replace(/[^0-9]/g, '');
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('8')) return '62' + d;
  return d;
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEmail(user?.email || '');
  }, [user?.name, user?.phone, user?.email]);

  const phoneChanged = !!user && normalize(phone) !== user.phone;

  const handleSendOtp = async () => {
    try {
      const res = await authService.requestOTP(phone, 'change-phone');
      setOtpSent(true);
      toast.success('Kode OTP dikirim ke nomor WhatsApp baru');
      if (res.devCode) {
        setOtp(res.devCode);
        toast.info(`Mode pengembangan: kode OTP ${res.devCode}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim OTP'));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    if (phoneChanged && !otp.trim()) {
      toast.error('Verifikasi nomor WhatsApp baru dengan kode OTP terlebih dahulu');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name,
        email: email.trim(),
        ...(phoneChanged ? { phone, otp } : {}),
      });
      setOtp('');
      setOtpSent(false);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memperbarui profil'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }
    setSavingPassword(true);
    try {
      await updateUser({ newPassword, currentPassword: currentPassword || undefined });
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Kata sandi berhasil disimpan');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan kata sandi'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Akun dan seluruh data Anda telah dihapus');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus akun'));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Kelola profil akun dan preferensi tampilan Anda.</p>
      </div>

      {/* Profil Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informasi Profil
          </CardTitle>
          <CardDescription>
            Nomor WhatsApp wajib dan digunakan untuk login OTP serta menerima notifikasi scan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setOtpSent(false);
                    setOtp('');
                  }}
                  placeholder="08123456789"
                />
                {phoneChanged && (
                  <Button type="button" variant="outline" onClick={handleSendOtp} className="shrink-0">
                    {otpSent ? 'Kirim Ulang' : 'Kirim OTP'}
                  </Button>
                )}
              </div>
              {phoneChanged && otpSent && (
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Kode OTP 6 digit"
                  maxLength={6}
                  inputMode="numeric"
                />
              )}
              {phoneChanged && (
                <p className="text-xs text-muted-foreground">
                  Mengganti nomor memerlukan verifikasi OTP ke nomor baru.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opsional, untuk login dengan kata sandi)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Kata Sandi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Kata Sandi
          </CardTitle>
          <CardDescription>
            {user?.hasPassword
              ? 'Ubah kata sandi untuk login dengan email.'
              : 'Buat kata sandi agar bisa login dengan email selain OTP WhatsApp.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePassword} className="space-y-4">
            {user?.hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Kata Sandi
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Theme Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            Tema Tampilan
          </CardTitle>
          <CardDescription>Pilih mode terang atau gelap sesuai kenyamanan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Mode Saat Ini</p>
            <p className="text-xs text-muted-foreground capitalize">{theme} mode</p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            Ganti ke Mode {theme === 'dark' ? 'Terang' : 'Gelap'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Zona Bahaya
          </CardTitle>
          <CardDescription>
            Menghapus akun akan menghapus seluruh data barang, stiker QR, dan riwayat laporan secara permanen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Hapus Akun Saya
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun Secara Permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Seluruh data barang, stiker QR, dan laporan Anda akan dihapus dari
              sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Menghapus...' : 'Hapus Akun'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
