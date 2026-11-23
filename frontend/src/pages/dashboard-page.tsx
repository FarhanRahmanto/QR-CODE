import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useItems, useToggleStatus } from '@/hooks/use-items';
import { ItemCard } from '@/components/item/item-card';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Package, AlertTriangle, ShieldCheck, MessageSquare, Sparkles, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: items, isLoading, error } = useItems();
  const toggleStatusMutation = useToggleStatus();
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'SAFE'>('ALL');

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      toast.success('Status barang berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat dashboard barang Anda..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Terjadi kesalahan saat memuat data barang.</p>
      </div>
    );
  }

  const itemList = items || [];
  const lostCount = itemList.filter((i) => i.status === 'LOST').length;
  const safeCount = itemList.filter((i) => i.status === 'SAFE').length;
  const totalComments = itemList.reduce((acc, i) => acc + (i.unreadComments || 0), 0);

  const filteredItems = itemList.filter((item) => {
    if (filter === 'LOST') return item.status === 'LOST';
    if (filter === 'SAFE') return item.status === 'SAFE';
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dashboard Pemilik</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {user?.name || 'Pemilik'} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Nomor WhatsApp Anda: <span className="font-semibold text-foreground">{user?.phone || 'Belum diatur'}</span> (otomatis digunakan untuk penerimaan notifikasi QR).
            </p>
          </div>

          <Button asChild className="h-11 px-5 rounded-2xl font-semibold shadow-md shrink-0">
            <Link to="/items/new">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Barang Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Barang</p>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight">{itemList.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status Aman</p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {safeCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow ${lostCount > 0 ? 'border-red-500/30 bg-red-500/5' : ''}`}>
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status Hilang</p>
              <p className="text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
                {lostCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Laporan Baru</p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {totalComments}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Daftar Barang Anda</h2>
          <p className="text-xs text-muted-foreground">Klik pada kartu untuk melihat QR code atau mengubah status.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua ({itemList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('LOST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'LOST'
                ? 'bg-red-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            Hilang ({lostCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('SAFE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'SAFE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-emerald-600'
            }`}
          >
            Aman ({safeCount})
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title={filter === 'ALL' ? 'Belum ada barang terdaftar' : 'Tidak ada barang dalam kategori ini'}
          description="Tambahkan barang Anda sekarang dan cetak stiker QR untuk ditempelkan."
          action={filter === 'ALL' ? { label: 'Tambah Barang Pertama', href: '/items/new' } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
