import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const salt = await bcrypt.genSalt();

  // Buat User Pembeli
  await prisma.user.upsert({
    where: { email: 'pembeli@example.com' },
    update: {},
    create: {
      email: 'pembeli@example.com',
      name: 'User Pembeli',
      password: await bcrypt.hash('password123', salt),
      role: Role.PEMBELI,
    },
  });

  // Buat User CS1
  await prisma.user.upsert({
    where: { email: 'cs1@example.com' },
    update: {},
    create: {
      email: 'cs1@example.com',
      name: 'User CS1',
      password: await bcrypt.hash('password123', salt),
      role: Role.CS1,
    },
  });

  // Buat User CS2
  await prisma.user.upsert({
    where: { email: 'cs2@example.com' },
    update: {},
    create: {
      email: 'cs2@example.com',
      name: 'User CS2',
      password: await bcrypt.hash('password123', salt),
      role: Role.CS2,
    },
  });

  console.log('Seeding finished.');

  // Buat Produk
  console.log('Start seeding products ...');

  const BASE_URL =
    'https://uerurpzxghmpptqgjkzq.supabase.co/storage/v1/object/public/product-images/';

  const productsData = [
    { name: "Papan Tulis Hitam 60x90cm", price: 375000, stock: 30, img: "blackboard.png" },
    { name: "Kipas Angin Dinding 16 Inch", price: 280000, stock: 75, img: "fan.png" },
    { name: "Topi Baseball Pria - Hitam Polos", price: 89000, stock: 150, img: "hat.png" },
    { name: "Celana Jeans Pria Slim Fit - Biru Tua", price: 349000, stock: 80, img: "jeans.png" },
    { name: "Pulpen Tinta Gel 0.5mm - Hitam (Pack 12)", price: 35000, stock: 300, img: "pen.png" },
    { name: "Kacamata Keselamatan (Safety Glasses)", price: 65000, stock: 120, img: "safety-glass.png" },
    { name: "Sepatu Lari Pria - Abu-abu", price: 599000, stock: 50, img: "shoes.png" },
    { name: "Smartphone Flagship 256GB - Garansi Resmi", price: 8999000, stock: 20, img: "smartphone.png" },
    { name: "Kaos Polos Katun Combed 30s - Putih", price: 95000, stock: 250, img: "tshirt.png" },
    { name: "Roda Gerobak Karet 8 Inch (Mati)", price: 110000, stock: 90, img: "wheel.png" },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        thumbnailUrl: `${BASE_URL}${p.img}`,
      },
    });
  }

  console.log('Products seeded.');
  console.log('Seeding finished.');
}



main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });