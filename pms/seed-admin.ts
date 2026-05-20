import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@nexus.com';
  const password = 'nexusadmin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'Master Admin' },
    create: {
      email,
      name: 'Master Admin',
      password: hashedPassword,
      role: 'Master Admin',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    },
  });

  console.log(`Master Admin ready!\nEmail: ${admin.email}\nPassword: ${password}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
