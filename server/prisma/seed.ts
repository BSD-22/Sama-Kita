import { promises as fs } from 'fs';

import { PrismaClient } from '@prisma/client';

import { hashPassword } from '../src/helpers/bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data first
  await prisma.$transaction([
    prisma.renterTransaction.deleteMany(),
    prisma.renterExpenses.deleteMany(),
    prisma.renter.deleteMany(),
    prisma.individualRoom.deleteMany(),
    prisma.room.deleteMany(),
    prisma.property.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Read the combined JSON data
  const data = JSON.parse(await fs.readFile('data.json', 'utf-8'));

  // Seed users first
  const users = [];
  for (const user of data.users) {
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: await hashPassword(user.password),
        name: user.name,
      },
    });
    users.push(createdUser);
  }

  // Seed properties
  const properties = [];
  for (const property of data.properties) {
    const createdProperty = await prisma.property.create({
      data: property,
    });
    properties.push(createdProperty);
  }

  // Seed rooms and create individual rooms
  const rooms = [];
  for (const room of data.rooms) {
    const createdRoom = await prisma.room.create({
      data: {
        typeName: room.typeName,
        price: room.price,
        roomImage: room.roomImage,
        Area: room.Area,
        propertyId: room.propertyId,
        totalRooms: room.totalRooms,
      },
    });
    rooms.push(createdRoom);

    // Create individual rooms for this room type
    for (let i = 0; i < room.totalRooms; i++) {
      await prisma.individualRoom.create({
        data: {
          roomNumber: `${room.typeName}-${i + 1}`,
          status: 'Available',
          roomId: createdRoom.id,
        },
      });
    }
  }

  // Seed renters
  const renters = [];
  for (const renter of data.renters) {
    const createdRenter = await prisma.renter.create({
      data: {
        renterName: renter.renterName,
        renterEmail: renter.renterEmail,
        renterPhone: renter.renterPhone,
        ktpNumber: renter.ktpNumber,
        depositAmount: renter.depositAmount,
        joinDate: new Date(renter.joinDate),
        leaveDate: new Date(renter.leaveDate),
        hasLeaved: renter.hasLeaved,
        userId: renter.userId,
        roomId: renter.roomId,
        individualRoomId: renter.individualRoomId,
        propertyId: renter.propertyId,
      },
    });
    renters.push(createdRenter);

    // Update individual room status to 'Rented' when renter is created
    if (!renter.hasLeaved) {
      await prisma.individualRoom.update({
        where: { id: renter.individualRoomId },
        data: { status: 'Rented' },
      });
    }
  }

  // Seed renter expenses
  for (const expense of data.renterexpenses) {
    await prisma.renterExpenses.create({
      data: {
        renterId: expense.renterId,
        maintenanceType: expense.maintenanceType,
        serviceDate: new Date(expense.serviceDate),
        serviceDescription: expense.serviceDescription,
        servicePrice: expense.servicePrice,
        serviceInvoice: expense.serviceInvoice,
        lastPaymentDate: new Date(expense.lastPaymentDate),
      },
    });
  }

  // Seed renter transactions with unique orderIds
  for (const transaction of data.rentertransactions) {
    await prisma.renterTransaction.create({
      data: {
        renterId: transaction.renterId,
        orderId: `${transaction.orderId}-${transaction.renterId}`, // Make orderId unique by adding renterId
        paymentStatus: transaction.paymentStatus,
        amount: transaction.amount,
        createdAt: new Date(transaction.createdAt),
        dueDate: new Date(transaction.dueDate),
        paidAt: transaction.paidAt ? new Date(transaction.paidAt) : null,
        isOverdue: transaction.isOverdue,
        month: transaction.month,
        year: transaction.year,
      },
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
