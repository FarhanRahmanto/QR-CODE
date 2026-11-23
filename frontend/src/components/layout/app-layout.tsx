import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
  QrCode,
  Package,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Package, label: 'Barang Saya' },
  { href: '/items/new', icon: PlusCircle, label: 'Tambah Barang' },
  { href: '/settings', icon: Settings, label: 'Pengaturan' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <QrCode className="h-6 w-6" />
            <span className="hidden sm:inline">TemuBarang</span>
          </Link>

          <div className="flex-1" />

          <ThemeToggle />

          <div className="flex items-center gap-2 pl-3 border-l">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user?.name || 'Pengguna'}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed md:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-60 border-r bg-background transition-transform duration-200 md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="flex flex-col h-full p-4 justify-between">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Button
              variant="ghost"
              className="justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Keluar Akun
            </Button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="container mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

