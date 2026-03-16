import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'atharvahunnur25@gmail.com';
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.users.findUnique({ where: { email } });
  
  if (existingAdmin) {
    await prisma.users.update({
      where: { email },
      data: { password_hash: hashedPassword, role: 'admin' }
    });
    console.log('Admin user updated');
  } else {
    await prisma.users.create({
      data: {
        name: 'Admin',
        email,
        password_hash: hashedPassword,
        role: 'admin'
      }
    });
    console.log('Admin user created');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
