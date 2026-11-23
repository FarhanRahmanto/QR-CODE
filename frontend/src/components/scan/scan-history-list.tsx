import { formatDistanceToNow, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Monitor, Globe, MapPin } from 'lucide-react';
import type { Scan } from '@/types';

interface ScanHistoryListProps {
  scans: Scan[];
}

function parseUserAgent(ua?: string): { icon: typeof Smartphone; label: string } {
  if (!ua) return { icon: Globe, label: 'Perangkat Tidak Dikenal' };
  if (ua.includes('iPhone')) return { icon: Smartphone, label: 'Apple iPhone (Safari)' };
  if (ua.includes('Samsung')) return { icon: Smartphone, label: 'Samsung Android' };
  if (ua.includes('Android')) return { icon: Smartphone, label: 'Android Phone (Chrome)' };
  return { icon: Monitor, label: 'Komputer / Desktop' };
}

export function ScanHistoryList({ scans }: ScanHistoryListProps) {
  if (scans.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-lg bg-card/50">
        <p className="text-sm">Belum ada riwayat scan pada stiker ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scans.map((scan) => {
        const device = parseUserAgent(scan.userAgent);
        const DeviceIcon = device.icon;

        return (
          <Card key={scan.id}>
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <DeviceIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{device.label}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(scan.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })} WIB
                  {' · '}
                  <span className="text-primary font-medium">
                    {formatDistanceToNow(new Date(scan.createdAt), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </span>
                </p>
                {scan.latitude != null && scan.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1 font-medium"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Lihat Lokasi Penemu ({scan.latitude}, {scan.longitude})
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

