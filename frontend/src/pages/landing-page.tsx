import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Bell, Shield, Smartphone, ArrowRight, ScanLine, MessageSquare } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <QrCode className="h-4 w-4" />
            Solusi Cerdas & Praktis untuk Barang Berharga
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Lindungi Barang Anda dengan{' '}
            <span className="text-primary">Stiker QR Cerdas</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tempelkan stiker QR pada tas, laptop, dompet, atau kunci Anda. Jika barang hilang, penemu cukup men-scan stiker untuk mengirim laporan langsung ke WhatsApp Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" className="h-12 px-8 text-base shadow-md" asChild>
              <Link to="/register">
                Mulai Lindungi Barang Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to="/login">Sudah Punya Akun</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="py-14 bg-muted/40 border-y px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bagaimana Cara Kerjanya?</h2>
            <p className="text-muted-foreground text-sm">Tiga langkah mudah untuk menjaga keamanan barang Anda.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: QrCode,
                title: 'Buat & Cetak Stiker',
                description: 'Daftar, masukkan info barang, lalu unduh atau cetak stiker QR siap tempel.',
              },
              {
                step: '2',
                icon: ScanLine,
                title: 'Penemu Scan QR',
                description: 'Cukup scan dengan kamera HP apapun, tanpa harus mengunduh aplikasi tambahan.',
              },
              {
                step: '3',
                icon: Bell,
                title: 'Notifikasi Otomatis',
                description: 'Anda mendapatkan laporan penemuan dan lokasi, serta dapat dihubungi via WhatsApp.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center space-y-3">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Keunggulan TemuBarang</h2>
            <p className="text-muted-foreground text-sm">Dirancang dengan mengutamakan privasi dan kemudahan.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Bell,
                title: 'Notifikasi Scan Otomatis',
                description: 'Setiap QR di-scan oleh orang lain, sistem langsung memberi kabar ke pemilik.',
              },
              {
                icon: Shield,
                title: 'Privasi Terjaga 100%',
                description: 'Nomor WhatsApp pemilik tidak pernah ditampilkan mentah ke publik.',
              },
              {
                icon: Smartphone,
                title: 'Tanpa Install Aplikasi',
                description: 'Penemu barang tidak perlu login atau daftar, langsung scan dan laporkan.',
              },
              {
                icon: MessageSquare,
                title: 'Kontrol Penuh Pemilik',
                description: 'Ubah status Aman atau Hilang sewaktu-waktu dan atur izin kontak WhatsApp.',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border">
                  <CardContent className="p-6 space-y-2">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="px-4">
        <div className="container mx-auto max-w-3xl rounded-2xl bg-primary text-primary-foreground p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Mulai Lindungi Barang Anda Sekarang</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto text-sm md:text-base">
            Jangan tunggu sampai barang Anda tertinggal. Cetak stiker QR dan amankan barang berharga Anda hari ini.
          </p>
          <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold shadow-md" asChild>
            <Link to="/register">
              Daftar Gratis Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

