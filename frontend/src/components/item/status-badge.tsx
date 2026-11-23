import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemStatus } from '@/types';

interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const isSafe = status === 'SAFE';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const Icon = isSafe ? ShieldCheck : AlertTriangle;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        sizeClasses[size],
        isSafe
          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        className
      )}
    >
      <Icon className={iconSize} />
      {isSafe ? 'Aman' : 'Hilang'}
    </span>
  );
}

