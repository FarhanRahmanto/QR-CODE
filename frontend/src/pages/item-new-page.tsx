import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useCreateItem } from '@/hooks/use-items';
import { ItemForm } from '@/components/item/item-form';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function ItemNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createItemMutation = useCreateItem();

  const handleSubmit = async (data: any) => {
    try {
      const newItem = await createItemMutation.mutateAsync({
        ownerName: data.ownerName,
        itemName: data.itemName,
        description: data.description,
        ownerMessage: data.ownerMessage,
        allowWhatsapp: data.allowWhatsapp,
        allowComments: data.allowComments,
        photo: data.photo,
      });
      toast.success('Barang berhasil ditambahkan!');
      navigate(`/items/${newItem.id}`);
    } catch {
      toast.error('Gagal menambahkan barang');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Barang Saya</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Tambah Barang</span>
      </div>

      <ItemForm
        mode="create"
        defaultValues={{
          ownerName: user?.name || '',
          allowWhatsapp: false,
        }}
        isLoading={createItemMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

