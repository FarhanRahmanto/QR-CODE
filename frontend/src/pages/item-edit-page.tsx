import { useParams, useNavigate, Link } from 'react-router';
import { useItem, useUpdateItem } from '@/hooks/use-items';
import { ItemForm } from '@/components/item/item-form';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function ItemEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = useItem(id || '');
  const updateItemMutation = useUpdateItem();

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat data barang..." />;
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

  const handleSubmit = async (data: any) => {
    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: {
          ownerName: data.ownerName,
          itemName: data.itemName,
          description: data.description,
          ownerMessage: data.ownerMessage,
          allowWhatsapp: data.allowWhatsapp,
          allowComments: data.allowComments,
          photo: data.photo,
        },
      });
      toast.success('Perubahan berhasil disimpan');
      navigate(`/items/${item.id}`);
    } catch {
      toast.error('Gagal menyimpan perubahan');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Barang Saya</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/items/${item.id}`} className="hover:text-foreground">{item.itemName}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Edit</span>
      </div>

      <ItemForm
        mode="edit"
        defaultValues={{
          ownerName: item.ownerName,
          itemName: item.itemName,
          description: item.description,
          ownerMessage: item.ownerMessage,
          allowWhatsapp: item.allowWhatsapp,
          allowComments: item.allowComments ?? true,
          photoUrl: item.photoUrl,
        }}
        isLoading={updateItemMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

