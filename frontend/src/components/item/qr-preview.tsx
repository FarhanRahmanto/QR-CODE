import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRPreviewProps {
  publicCode: string;
  itemName: string;
  appUrl?: string;
}

export function QRPreview({ publicCode, itemName, appUrl = window.location.origin }: QRPreviewProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const scanUrl = `${appUrl}/s/${publicCode}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${itemName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR Code berhasil diunduh');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    toast.success('Link scan berhasil disalin');
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stiker QR - ${itemName}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
            .sticker { text-align: center; padding: 24px; border: 2px dashed #333; border-radius: 12px; max-width: 280px; }
            .sticker img { width: 200px; height: 200px; }
            .sticker h3 { margin: 12px 0 4px; font-size: 16px; }
            .sticker p { margin: 0; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <div class="sticker">
            <img src="${canvas.toDataURL('image/png')}" alt="QR Code" />
            <h3>${itemName}</h3>
            <p>Scan jika Anda menemukan barang ini</p>
            <p style="font-size: 10px; margin-top: 8px; color: #888;">Kode: ${publicCode}</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stiker QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={qrRef} className="flex justify-center p-4 bg-white rounded-lg border">
          <QRCodeCanvas value={scanUrl} size={180} level="H" includeMargin />
        </div>
        <div className="text-center">
          <p className="text-xs font-mono font-medium text-foreground">{publicCode}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{scanUrl}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Unduh PNG
          </Button>
          <Button onClick={handlePrint} variant="outline" className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Cetak Stiker
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Salin Tautan Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

