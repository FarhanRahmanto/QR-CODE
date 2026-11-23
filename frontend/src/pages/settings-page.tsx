import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getErrorMessage } from '@/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, Sun, Moon, Trash2, ShieldAlert, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const normalizePhone = (p: string) => {
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
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.email, user?.phone]);

  const emailChanged = !!user && email.trim().toLowerCase() !== (user.email || '').toLowerCase();
  const phoneChanged = !!user && normalizePhone(phone) !== user.phone;
  const needsPassword = emailChanged || phoneChanged;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    if (needsPassword && !profilePassword) {
      toast.error('Masukkan kata sandi saat ini untuk mengubah email atau nomor WhatsApp');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        ...(emailChanged ? { email: email.trim() } : {}),
        ...(phoneChanged ? { phone } : {}),
        ...(needsPassword ? { currentPassword: profilePassword } : {}),
      });
      setProfilePassword('');
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memperbarui profil'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Masukkan kata sandi saat ini');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Kata sandi baru minimal 8 karakter');
      return;
    }
    setSavingPassword(true);
    try {
      await updateUser({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Kata sandi berhasil diubah');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengubah kata sandi'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error('Masukkan kata sandi untuk konfirmasi');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Akun dan seluruh data Anda telah dihapus');
      setDeleteOpen(false);
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus akun'));
    } finally {
      setDeleting(false);
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
            Email dipakai untuk login. Nomor WhatsApp dipakai agar penemu bisa menghubungi Anda dan untuk
            notifikasi scan (tidak pernah ditampilkan ke publik).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (untuk login)</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor WhatsApp (kontak untuk penemu)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
              />
            </div>

            {needsPassword && (
              <div className="space-y-2 rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20 p-3">
                <Label htmlFor="profilePassword">Konfirmasi Kata Sandi Saat Ini</Label>
                <Input
                  id="profilePassword"
                  type="password"
                  autoComplete="current-password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Demi keamanan, perubahan email atau nomor WhatsApp memerlukan kata sandi Anda.
                </p>
              </div>
            )}

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
            Ubah Kata Sandi
          </CardTitle>
          <CardDescription>Gunakan minimal 8 karakter yang sulit ditebak.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
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
            Menghapus akun akan menghapus seluruh data barang, foto, stiker QR, dan riwayat laporan secara permanen.
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
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletePassword('');
        }}
      >
        <AlertDialogContent>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Akun Secara Permanen?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Masukkan kata sandi Anda untuk konfirmasi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Kata sandi"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Batal</AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Akun
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
