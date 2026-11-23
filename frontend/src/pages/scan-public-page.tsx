import { useState } from 'react';
import { useParams } from 'react-router';
import { usePublicItem, useSubmitComment, useWhatsappRedirect } from '@/hooks/use-public-item';
import { CommentForm } from '@/components/comment/comment-form';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
  FileText,
  User,
  Package,
  ExternalLink,
  QrCode,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { publicService } from '@/services/public';
import { getErrorMessage } from '@/services/api-client';

export function ScanPublicPage() {
  const { code } = useParams<{ code: string }>();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isSuccessComment, setIsSuccessComment] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  const { data: item, isLoading, error } = usePublicItem(code || '');
  const submitCommentMutation = useSubmitComment(code || '');
  const { refetch: fetchWhatsappUrl } = useWhatsappRedirect(code || '');

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memeriksa identitas stiker barang..." />;
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl border-border/60 shadow-xl bg-card/90">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 mb-4 shadow-inner">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2 tracking-tight">Stiker Tidak Dikenali</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Kode QR ini tidak terdaftar atau sudah dinonaktifkan oleh pemiliknya.
          </p>
        </Card>
      </div>
    );
  }

  const isLost = item.status === 'LOST';

  const handleWhatsappClick = async () => {
    try {
      const res = await fetchWhatsappUrl();
      if (res.data) {
        window.open(res.data, '_blank');
      } else {
        toast.error('Tidak dapat mengalihkan ke WhatsApp');
      }
    } catch {
      toast.error('Gagal membuka tautan WhatsApp');
    }
  };

  const handleCommentSubmit = async (data: any) => {
    try {
      await submitCommentMutation.mutateAsync(data);
      setIsSuccessComment(true);
      toast.success('Laporan penemuan berhasil dikirim ke pemilik!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim laporan'));
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung berbagi lokasi');
      return;
    }
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await publicService.shareLocation(code || '', pos.coords.latitude, pos.coords.longitude);
          setLocationShared(true);
          toast.success('Lokasi berhasil dibagikan ke pemilik. Terima kasih!');
        } catch (err) {
          toast.error(getErrorMessage(err, 'Gagal membagikan lokasi'));
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        setSharingLocation(false);
        toast.error('Izin lokasi ditolak');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 via-background to-muted/30 py-8 px-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-4">
        {/* Branding header */}
        <div className="text-center space-y-1 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border/60 text-xs font-semibold shadow-xs">
            <QrCode className="h-3.5 w-3.5 text-primary" />
            <span>TemuBarang Verified Tag</span>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`p-4 rounded-3xl text-center font-bold text-white shadow-lg flex items-center justify-center gap-2.5 transition-all ${
            isLost
              ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/25 ring-2 ring-red-400/30'
              : 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-emerald-500/25'
          }`}
        >
          {isLost ? (
            <>
              <AlertTriangle className="h-5 w-5 animate-bounce shrink-0" />
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider">
                Perhatian: Barang Ini Sedang Hilang
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider">
                Status Barang: Aman
              </span>
            </>
          )}
        </div>

        {/* Item Card (Tag Design) */}
        <Card className="overflow-hidden shadow-xl border-border/60 rounded-3xl bg-card/95 backdrop-blur-md">
          {item.photoUrl ? (
            <div className="aspect-[16/10] w-full bg-muted overflow-hidden relative">
              <img src={item.photoUrl} alt={item.itemName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="aspect-[16/10] w-full bg-muted/40 flex flex-col items-center justify-center text-muted-foreground/30">
              <Package className="h-16 w-16 stroke-[1.5]" />
              <span className="text-xs font-medium mt-1">Foto Belum Ditambahkan</span>
            </div>
          )}

          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight">{item.itemName}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <User className="h-4 w-4 text-primary" />
                Pemilik: <span className="font-semibold text-foreground">{item.ownerName}</span>
              </p>
            </div>

            {/* Ciri-ciri */}
            <div className="space-y-1 rounded-2xl bg-muted/40 p-4 border border-border/50">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Ciri-ciri Khusus Barang
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Pesan Pemilik */}
            {item.ownerMessage && (
              <div className="space-y-1 rounded-2xl bg-primary/5 p-4 border border-primary/20">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  💬 Pesan Penting dari Pemilik
                </h4>
                <p className="text-sm font-medium italic leading-relaxed">&ldquo;{item.ownerMessage}&rdquo;</p>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="space-y-2.5 pt-2">
              {item.allowWhatsapp && (
                <Button
                  onClick={handleWhatsappClick}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Hubungi Pemilik via WhatsApp
                  <ExternalLink className="h-4 w-4 ml-auto opacity-70" />
                </Button>
              )}

              {item.allowComments !== false && (
                <Button
                  variant={item.allowWhatsapp ? 'outline' : 'default'}
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="w-full h-12 rounded-2xl font-bold text-sm gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {showCommentForm ? 'Tutup Formulir Laporan' : 'Kirim Laporan / Lokasi Penemuan'}
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleShareLocation}
                disabled={sharingLocation || locationShared}
                className="w-full h-11 rounded-2xl text-sm gap-2 text-muted-foreground"
              >
                <MapPin className="h-4 w-4" />
                {locationShared
                  ? 'Lokasi sudah dibagikan'
                  : sharingLocation
                    ? 'Mengambil lokasi...'
                    : 'Bagikan Lokasi Saya ke Pemilik'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form Section */}
        {showCommentForm && (
          <div className="pt-1 animate-in fade-in-0 duration-300">
            <CommentForm
              onSubmit={handleCommentSubmit}
              isLoading={submitCommentMutation.isPending}
              isSuccess={isSuccessComment}
            />
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground pt-2 px-4 leading-relaxed">
          🔒 Pemilik telah menerima notifikasi otomatis saat QR ini dibuka. Nomor kontak terlindungi secara aman melalui sistem kami.
        </p>
      </div>
    </div>
  );
}
