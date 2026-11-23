import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from './image-uploader';
import { ConsentToggle } from './consent-toggle';
import { Switch } from '@/components/ui/switch';
import { Loader2, MessageSquareText } from 'lucide-react';

const itemSchema = z.object({
  ownerName: z.string().min(2, 'Nama pemilik minimal 2 karakter'),
  itemName: z.string().min(2, 'Nama barang minimal 2 karakter'),
  description: z.string().min(10, 'Ciri-ciri minimal 10 karakter'),
  ownerMessage: z.string().optional(),
  allowWhatsapp: z.boolean().default(false),
  allowComments: z.boolean().default(true),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  defaultValues?: Partial<ItemFormValues & { photoUrl?: string }>;
  onSubmit: (data: ItemFormValues & { photo?: File }) => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function ItemForm({ defaultValues, onSubmit, isLoading, mode }: ItemFormProps) {
  const [photo, setPhoto] = useState<File | undefined>();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      ownerName: defaultValues?.ownerName ?? '',
      itemName: defaultValues?.itemName ?? '',
      description: defaultValues?.description ?? '',
      ownerMessage: defaultValues?.ownerMessage ?? '',
      allowWhatsapp: defaultValues?.allowWhatsapp ?? false,
      allowComments: defaultValues?.allowComments ?? true,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({ ...data, photo });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Tambah Barang Baru' : 'Edit Barang'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Nama Pemilik</Label>
            <Input
              id="ownerName"
              placeholder="Masukkan nama pemilik"
              {...form.register('ownerName')}
            />
            {form.formState.errors.ownerName && (
              <p className="text-sm text-red-500">{form.formState.errors.ownerName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">Nama Barang</Label>
            <Input
              id="itemName"
              placeholder="Contoh: Tas Ransel Hitam"
              {...form.register('itemName')}
            />
            {form.formState.errors.itemName && (
              <p className="text-sm text-red-500">{form.formState.errors.itemName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Foto Barang</Label>
            <ImageUploader value={photo || defaultValues?.photoUrl} onChange={setPhoto} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Ciri-ciri Barang</Label>
            <Textarea
              id="description"
              placeholder="Deskripsikan ciri-ciri barang agar mudah dikenali oleh penemu..."
              rows={3}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerMessage">Pesan untuk Penemu (Opsional)</Label>
            <Textarea
              id="ownerMessage"
              placeholder="Contoh: Tolong hubungi saya, ada imbalan..."
              rows={2}
              {...form.register('ownerMessage')}
            />
          </div>

          <ConsentToggle
            allowed={form.watch('allowWhatsapp')}
            onChange={(value) => form.setValue('allowWhatsapp', value)}
          />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="comments-consent" className="text-sm font-medium cursor-pointer">
                  Terima Laporan dari Penemu
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {form.watch('allowComments')
                    ? 'Penemu bisa mengirim pesan & lokasi penemuan lewat halaman scan'
                    : 'Formulir laporan disembunyikan dari halaman scan'}
                </p>
              </div>
            </div>
            <Switch
              id="comments-consent"
              checked={form.watch('allowComments')}
              onCheckedChange={(value) => form.setValue('allowComments', value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1 h-12">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Simpan & Buat QR' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}

