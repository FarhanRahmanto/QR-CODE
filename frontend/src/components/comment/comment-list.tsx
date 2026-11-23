import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, User, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  onMarkRead?: (commentId: string) => void;
}

export function CommentList({ comments, onMarkRead }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-lg bg-card/50">
        <p className="text-sm">Belum ada laporan dari penemu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Card
          key={comment.id}
          className={cn(
            'transition-colors',
            !comment.isRead && 'border-l-4 border-l-primary bg-primary/5',
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{comment.finderName || 'Anonim'}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </span>
                  {!comment.isRead && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">
                      Baru
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{comment.message}</p>
                {comment.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{comment.location}</span>
                  </p>
                )}
              </div>
              {!comment.isRead && onMarkRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkRead(comment.id)}
                  className="shrink-0 text-xs h-8"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Tandai Dibaca
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

