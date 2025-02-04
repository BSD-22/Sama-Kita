import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { hashPassword } from '../src/helpers/bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Read the combined JSON data
  const data = JSON.parse(await fs.readFile('data.json', 'utf-8'));

  // Seed users
  for (const user of data.users) {
    user.password = await hashPassword(user.password);
    await prisma.user.create({
      data: user,
    });
  }

  // Seed properties
  for (const property of data.properties) {
    await prisma.property.create({
      data: property,
    });
  }

  // Seed rooms
  for (const room of data.rooms) {
    await prisma.room.create({
      data: room,
    });
  }

  // Seed renters
  for (const renter of data.renters) {
    await prisma.renter.create({
      data: renter,
    });
  }

  // Seed renter expenses
  for (const renterExpense of data.renterexpenses) {
    await prisma.renterExpenses.create({
      data: renterExpense,
    });
  }

  for (const renterTransaction of data.rentertransactions) {
    await prisma.renterTransaction.create({
      data: renterTransaction,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
