import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      fullName: 'Super Admin',
    },
  });

  console.log(`Seeded admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });