import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import type { ItemStatus } from '@/types';

interface StatusToggleProps {
  status: ItemStatus;
  onToggle: () => void;
  disabled?: boolean;
}

export function StatusToggle({ status, onToggle, disabled }: StatusToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isLost = status === 'LOST';

  const handleChange = () => {
    if (!isLost) {
      setShowConfirm(true);
    } else {
      onToggle();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Switch
          id="status-toggle"
          checked={isLost}
          onCheckedChange={handleChange}
          disabled={disabled}
          className={isLost ? "bg-red-600" : "bg-green-600"}
        />
        <Label
          htmlFor="status-toggle"
          className={isLost ? 'text-red-600 dark:text-red-400 font-semibold text-xs' : 'text-green-600 dark:text-green-400 font-semibold text-xs'}
        >
          {isLost ? 'HILANG' : 'AMAN'}
        </Label>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tandai Barang Hilang?</AlertDialogTitle>
            <AlertDialogDescription>
              Halaman publik scan akan langsung menampilkan banner merah tanda barang hilang. Penemu dapat melihat pesan Anda dan segera menghubungi Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirm(false);
                onToggle();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ya, Tandai Hilang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

