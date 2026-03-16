import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newUsername = 'admin123';
  const newPassword = 'admin123';
  
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Find the existing admin user
  const adminUser = await prisma.users.findFirst({
    where: { role: 'admin' }
  });

  if (adminUser) {
    console.log(`Updating existing admin (ID: ${adminUser.id}, Email: ${adminUser.email}) to username: ${newUsername}`);
    
    await prisma.users.update({
      where: { id: adminUser.id },
      data: {
        email: newUsername,
        password_hash: hashedPassword,
        name: 'System Admin'
      }
    });
    
    console.log('Admin user updated successfully.');
  } else {
    console.log(`No admin user found. Creating new admin with username: ${newUsername}`);
    
    await prisma.users.create({
      data: {
        name: 'System Admin',
        email: newUsername,
        password_hash: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('New admin user created successfully.');
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
