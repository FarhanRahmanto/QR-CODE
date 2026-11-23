import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  useItem,
  useToggleStatus,
  useDeleteItem,
  useItemComments,
  useMarkCommentRead,
  useItemScans,
} from '@/hooks/use-items';
import { StatusBadge } from '@/components/item/status-badge';
import { StatusToggle } from '@/components/item/status-toggle';
import { QRPreview } from '@/components/item/qr-preview';
import { CommentList } from '@/components/comment/comment-list';
import { ScanHistoryList } from '@/components/scan/scan-history-list';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  ChevronRight,
  Edit,
  Trash2,
  ExternalLink,
  MessageSquare,
  QrCode,
  History,
  Shield,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: item, isLoading } = useItem(id || '');
  const toggleStatusMutation = useToggleStatus();
  const deleteItemMutation = useDeleteItem();
  const { data: comments = [] } = useItemComments(id || '');
  const markCommentReadMutation = useMarkCommentRead();
  const { data: scans = [] } = useItemScans(id || '');

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat detail barang..." />;
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Barang tidak ditemukan.</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync(item.id);
      toast.success('Status barang berhasil diubah');
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItemMutation.mutateAsync(item.id);
      toast.success('Barang berhasil dihapus');
      navigate('/dashboard');
    } catch {
      toast.error('Gagal menghapus barang');
    }
  };

  const handleMarkCommentRead = async (commentId: string) => {
    try {
      await markCommentReadMutation.mutateAsync(commentId);
      toast.success('Laporan ditandai sudah dibaca');
    } catch {
      toast.error('Gagal memperbarui status laporan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link to="/dashboard" className="hover:text-foreground">Barang Saya</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{item.itemName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/s/${item.publicCode}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-1" />
              Lihat Halaman Scan
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/items/${item.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid: Details & QR */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Status */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
              <div>
                <h1 className="text-2xl font-bold">{item.itemName}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Pemilik: {item.ownerName}</p>
              </div>
              <StatusBadge status={item.status} size="lg" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo */}
              {item.photoUrl ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden border">
                  <img src={item.photoUrl} alt={item.itemName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}

              {/* Status Toggle Box */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <h4 className="font-semibold text-sm">Status Saat Ini</h4>
                  <p className="text-xs text-muted-foreground">
                    {item.status === 'LOST'
                      ? 'Barang ditandai HILANG. Halaman scan publik menampilkan tanda bahaya merah.'
                      : 'Barang berstatus AMAN. Halaman scan publik menampilkan status aman hijau.'}
                  </p>
                </div>
                <StatusToggle status={item.status} onToggle={handleToggleStatus} />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground">Ciri-ciri Barang</h4>
                <p className="text-sm whitespace-pre-wrap">{item.description}</p>
              </div>

              {/* Owner Message */}
              {item.ownerMessage && (
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-muted-foreground">Pesan untuk Penemu</h4>
                  <p className="text-sm italic whitespace-pre-wrap">&ldquo;{item.ownerMessage}&rdquo;</p>
                </div>
              )}

              {/* WhatsApp permission notice */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Shield className="h-4 w-4 text-primary" />
                <span>
                  {item.allowWhatsapp
                    ? 'Izin WhatsApp aktif: Penemu dapat mengklik tombol redirect WhatsApp.'
                    : 'Izin WhatsApp nonaktif: Penemu hanya bisa mengirim laporan melalui formulir.'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Reports & Scans */}
          <Tabs defaultValue="comments">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Laporan Penemu ({comments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="scans" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Riwayat Scan ({scans.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              <CommentList
                comments={comments}
                onMarkRead={handleMarkCommentRead}
              />
            </TabsContent>

            <TabsContent value="scans" className="mt-4">
              <ScanHistoryList scans={scans} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: QR Code Sticker */}
        <div className="space-y-6">
          <QRPreview
            publicCode={item.publicCode}
            itemName={item.itemName}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Stiker QR untuk barang ini tidak akan dapat diakses lagi oleh penemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

