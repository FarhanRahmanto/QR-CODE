import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Delete existing data
  await prisma.photo.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      phone: '628123456789',
      email: 'budi.santoso@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${user.name} (${user.phone} / ${user.email})`);

  // Create demo items
  const item1 = await prisma.item.create({
    data: {
      publicCode: 'aBcDeFgHiJ',
      ownerId: user.id,
      ownerName: user.name,
      itemName: 'Tas Ransel Eiger Hitam',
      photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
      description: 'Tas ransel hitam merk Eiger ukuran medium, ada gantungan kunci kuning berbentuk bintang di resleting depan.',
      ownerMessage: 'Tolong hubungi saya jika menemukan tas ini. Ada laptop dan dokumen kantor penting di dalamnya. Akan ada imbalan yang pantas.',
      status: 'LOST',
      allowWhatsapp: true,
    },
  });

  const item2 = await prisma.item.create({
    data: {
      publicCode: 'kLmNoPqRsT',
      ownerId: user.id,
      ownerName: user.name,
      itemName: 'Laptop ASUS ROG Strix',
      photoUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
      description: 'Laptop gaming ASUS ROG Strix 15 inci, warna hitam, ada stiker GitHub dan robot di bagian penutup casing.',
      ownerMessage: 'Jika menemukan laptop ini, mohon segera kabari. Terima kasih banyak atas kebaikan Anda.',
      status: 'LOST',
      allowWhatsapp: true,
    },
  });

  const item3 = await prisma.item.create({
    data: {
      publicCode: 'uVwXyZaBcD',
      ownerId: user.id,
      ownerName: user.name,
      itemName: 'Dompet Kulit Fossil Coklat',
      photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      description: 'Dompet lipat kulit warna coklat tua merk Fossil. Ada inisial "BS" di sudut kanan bawah.',
      ownerMessage: 'KTP dan kartu identitas saya ada di dompet ini.',
      status: 'SAFE',
      allowWhatsapp: false,
    },
  });

  // Create demo comments
  await prisma.comment.create({
    data: {
      itemId: item1.id,
      finderName: 'Rian Pratama',
      message: 'Halo mas Budi, saya melihat tas dengan ciri-ciri serupa tertinggal di kursi tunggu peron 3 stasiun Manggarai.',
      location: 'Stasiun Manggarai, Jakarta Selatan',
      isRead: false,
    },
  });

  await prisma.comment.create({
    data: {
      itemId: item1.id,
      finderName: 'Petugas Pengamanan Stasiun',
      message: 'Tas sudah diamankan di pos satpam lantai 1 pintu timur.',
      location: 'Pos Satpam Pintu Timur',
      isRead: false,
    },
  });

  await prisma.comment.create({
    data: {
      itemId: item2.id,
      finderName: 'Dina Barista',
      message: 'Laptop tertinggal di meja no 8 cafe Senja. Sudah kami simpan di meja kasir.',
      location: 'Kopi Senja Tebet',
      isRead: false,
    },
  });

  // Create demo scans
  await prisma.scan.create({
    data: {
      itemId: item1.id,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    },
  });

  await prisma.scan.create({
    data: {
      itemId: item1.id,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S24) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
    },
  });

  console.log('Seeding completed successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

