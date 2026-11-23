import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { StatusToggle } from './status-toggle';
import { MessageSquare, Package, ChevronRight } from 'lucide-react';
import type { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onToggleStatus: (id: string) => void;
}

export function ItemCard({ item, onToggleStatus }: ItemCardProps) {
  const isLost = item.status === 'LOST';

  return (
    <Card className={`group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border/60 bg-card/90 backdrop-blur-sm ${
      isLost ? 'ring-1 ring-red-500/30' : ''
    }`}>
      <Link to={`/items/${item.id}`} className="block relative">
        <div className="aspect-[16/10] relative bg-muted/40 overflow-hidden">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.itemName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <Package className="h-12 w-12 stroke-[1.5]" />
              <span className="text-[11px] font-medium mt-1">Tanpa Foto</span>
            </div>
          )}
          <div className="absolute top-3 right-3 shadow-md">
            <StatusBadge status={item.status} size="sm" />
          </div>
        </div>
      </Link>

      <CardContent className="p-5 space-y-4">
        <div>
          <Link to={`/items/${item.id}`} className="flex items-center justify-between group/title">
            <h3 className="font-bold text-base tracking-tight truncate group-hover/title:text-primary transition-colors">
              {item.itemName}
            </h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover/title:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <StatusToggle
            status={item.status}
            onToggle={() => onToggleStatus(item.id)}
          />

          {item.unreadComments > 0 ? (
            <Link
              to={`/items/${item.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{item.unreadComments} Laporan</span>
            </Link>
          ) : (
            <span className="text-[11px] text-muted-foreground">0 Laporan</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
