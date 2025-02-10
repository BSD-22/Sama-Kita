import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { hashPassword } from '../src/helpers/bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Read the combined JSON data
  const data = JSON.parse(await fs.readFile('data.json', 'utf-8'));

  // Seed users first
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

  // Seed rooms and create individual rooms
  for (const room of data.rooms) {
    await prisma.room.create({
      data: {
        typeName: room.typeName,
        price: room.price,
        roomImage: room.roomImage,
        Area: room.Area,
        propertyId: room.propertyId,
        totalRooms: room.totalRooms,
        individualRooms: {
          create: Array.from({ length: room.totalRooms }, (_, i) => ({
            roomNumber: `${room.typeName}-${i + 1}`,
            status: 'Available',
          })),
        },
      },
      include: {
        individualRooms: true,
      },
    });
  }

  // Seed renters
  for (const renter of data.renters) {
    // Find the room based on property and type
    const room = await prisma.room.findFirst({
      where: {
        propertyId: renter.propertyId,
        // Assuming the first room type for now, you might want to adjust this logic
        typeName: 'Standard',
      },
    });

    if (!room) {
      console.error(`Room not found for renter ${renter.renterName}`);
      continue;
    }

    await prisma.renter.create({
      data: {
        renterName: renter.renterName,
        renterEmail: renter.renterEmail,
        renterPhone: renter.renterPhone,
        ktpNumber: renter.ktpNumber,
        depositAmount: renter.depositAmount,
        joinDate: new Date(renter.joinDate),
        leaveDate: new Date(renter.leaveDate),
        hasLeaved: renter.hasLeaved,
        user: {
          connect: { id: renter.userId },
        },
        room: {
          connect: { id: room.id },
        },
        individualRoom: {
          connect: { id: renter.individualRoomId },
        },
        property: {
          connect: { id: renter.propertyId },
        },
      },
    });
  }

  // Seed renter expenses
  for (const renterExpense of data.renterexpenses) {
    await prisma.renterExpenses.create({
      data: {
        ...renterExpense,
        serviceDate: new Date(renterExpense.serviceDate),
        lastPaymentDate: new Date(renterExpense.lastPaymentDate),
      },
    });
  }

  // Seed renter transactions
  for (const renterTransaction of data.rentertransactions) {
    await prisma.renterTransaction.create({
      data: {
        ...renterTransaction,
        createdAt: new Date(renterTransaction.createdAt),
      },
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
