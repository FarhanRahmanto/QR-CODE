import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';

interface ConsentToggleProps {
  allowed: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ConsentToggle({ allowed, onChange, disabled }: ConsentToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-green-600" />
        <div>
          <Label htmlFor="whatsapp-consent" className="text-sm font-medium cursor-pointer">
            Izinkan Penemu Menghubungi via WhatsApp
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allowed
              ? 'Tombol WhatsApp tampil di halaman publik (nomor tetap tersembunyi via redirect)'
              : 'Tombol WhatsApp disembunyikan dari penemu'}
          </p>
        </div>
      </div>
      <Switch
        id="whatsapp-consent"
        checked={allowed}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

