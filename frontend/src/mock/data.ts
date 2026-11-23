import type { User, Item, Comment, Scan } from '@/types';

export const mockUser: User = {
  id: 'usr_1',
  name: 'Budi Santoso',
  phone: '628123456789',
  email: 'budi.santoso@example.com',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const initialMockItems: Item[] = [
  {
    id: 'item_1',
    publicCode: 'aBcDeFgHiJ',
    ownerId: 'usr_1',
    ownerName: 'Budi Santoso',
    itemName: 'Tas Ransel Eiger Hitam',
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    description: 'Tas ransel hitam merk Eiger ukuran medium, ada gantungan kunci kuning berbentuk bintang di resleting depan.',
    ownerMessage: 'Tolong hubungi saya jika menemukan tas ini. Ada laptop dan dokumen kantor penting di dalamnya. Akan ada imbalan yang pantas.',
    status: 'LOST',
    allowWhatsapp: true,
    unreadComments: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item_2',
    publicCode: 'kLmNoPqRsT',
    ownerId: 'usr_1',
    ownerName: 'Budi Santoso',
    itemName: 'Laptop ASUS ROG Strix',
    photoUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
    description: 'Laptop gaming ASUS ROG Strix 15 inci, warna hitam, ada stiker GitHub dan robot di bagian penutup casing.',
    ownerMessage: 'Jika menemukan laptop ini, mohon segera kabari. Terima kasih banyak atas kebaikan Anda.',
    status: 'LOST',
    allowWhatsapp: true,
    unreadComments: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item_3',
    publicCode: 'uVwXyZaBcD',
    ownerId: 'usr_1',
    ownerName: 'Budi Santoso',
    itemName: 'Dompet Kulit Fossil Coklat',
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
    description: 'Dompet lipat kulit warna coklat tua merk Fossil. Ada inisial "BS" di sudut kanan bawah.',
    ownerMessage: 'KTP dan kartu identitas saya ada di dompet ini.',
    status: 'SAFE',
    allowWhatsapp: false,
    unreadComments: 0,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item_4',
    publicCode: 'eFgHiJkLmN',
    ownerId: 'usr_1',
    ownerName: 'Budi Santoso',
    itemName: 'Kunci Motor Honda Vario',
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800',
    description: 'Kunci remote smart key motor Honda Vario 160 dengan gantungan kulit merah.',
    ownerMessage: 'Kunci motor utama untuk aktivitas kerja harian.',
    status: 'SAFE',
    allowWhatsapp: true,
    unreadComments: 0,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const initialMockComments: Comment[] = [
  {
    id: 'comm_1',
    itemId: 'item_1',
    finderName: 'Rian Pratama',
    message: 'Halo mas Budi, saya melihat tas dengan ciri-ciri serupa tertinggal di kursi tunggu stasiun Manggarai.',
    location: 'Stasiun Manggarai, Jakarta Selatan',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comm_2',
    itemId: 'item_1',
    finderName: 'Petugas Keamanan Stasiun',
    message: 'Tas sudah diamankan di pos pengamanan stasiun peron 3.',
    location: 'Pos Satpam Stasiun Manggarai',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comm_3',
    itemId: 'item_2',
    finderName: 'Dina Barista',
    message: 'Laptop tertinggal di meja no 8 cafe Senja. Sudah kami simpan di meja kasir.',
    location: 'Kopi Senja Tebet',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const initialMockScans: Scan[] = [
  {
    id: 'scan_1',
    itemId: 'item_1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'scan_2',
    itemId: 'item_1',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S24) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'scan_3',
    itemId: 'item_2',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) Mobile/15E148',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

