import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Send, Loader2 } from 'lucide-react';

const commentSchema = z.object({
  finderName: z.string().optional(),
  message: z.string().min(5, 'Pesan laporan minimal 5 karakter'),
  location: z.string().optional(),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (data: CommentFormValues) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function CommentForm({ onSubmit, isLoading, isSuccess }: CommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      finderName: '',
      message: '',
      location: '',
    },
  });

  if (isSuccess) {
    return (
      <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="py-8 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Laporan Berhasil Terkirim!</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Terima kasih banyak atas bantuan dan kejujuran Anda! Pemilik akan segera menerima notifikasi pesan ini.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">✍️ Kirim Laporan Penemuan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finderName">Nama Anda (Opsional)</Label>
            <Input
              id="finderName"
              placeholder="Contoh: Rian (atau biarkan kosong jika anonim)"
              {...form.register('finderName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Pesan / Kondisi Barang *</Label>
            <Textarea
              id="message"
              placeholder="Contoh: Saya menemukan tas ini di kursi ruang tunggu terminal 2..."
              rows={3}
              {...form.register('message')}
            />
            {form.formState.errors.message && (
              <p className="text-xs text-red-500">{form.formState.errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Lokasi Penemuan (Opsional)
            </Label>
            <Input
              id="location"
              placeholder="Contoh: Meja kasir Cafe Senja"
              {...form.register('location')}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Kirim Laporan ke Pemilik
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

