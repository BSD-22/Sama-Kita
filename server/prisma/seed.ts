import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/helpers/bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
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
    const data = JSON.parse(readFileSync('data.json', 'utf-8'));

    // Seed users with duplicate checking
    console.log('Seeding users...');
    for (const user of data.users) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          const hashedPassword = await hashPassword(user.password);
          await prisma.user.create({
            data: { ...user, password: hashedPassword },
          });
          console.log(`Created user: ${user.email}`);
        } else {
          console.log(`Skipping duplicate user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    // Seed properties
    console.log('\nSeeding properties...');
    for (const property of data.properties) {
      try {
        const existingProperty = await prisma.property.findFirst({
          where: { propertyName: property.propertyName }
        });

        if (!existingProperty) {
          await prisma.property.create({ data: property });
          console.log(`Created property: ${property.propertyName}`);
        } else {
          console.log(`Skipping duplicate property: ${property.propertyName}`);
        }
      } catch (error) {
        console.error(`Error processing property ${property.propertyName}:`, error);
      }
    }

    // Seed rooms and individual rooms
    console.log('\nSeeding rooms...');
    for (const room of data.rooms) {
      try {
        const existingRoom = await prisma.room.findFirst({
          where: {
            typeName: room.typeName,
            propertyId: room.propertyId
          }
        });

        if (!existingRoom) {
          const createdRoom = await prisma.room.create({
            data: {
              ...room,
              individualRooms: {
                create: Array.from({ length: room.totalRooms }, (_, i) => ({
                  roomNumber: `${room.typeName}-${i + 1}`,
                  status: 'Available',
                })),
              },
            },
          });
          console.log(`Created room type ${room.typeName} with ${room.totalRooms} individual rooms`);
        } else {
          console.log(`Skipping duplicate room type: ${room.typeName}`);
        }
      } catch (error) {
        console.error(`Error processing room ${room.typeName}:`, error);
      }
    }

    // Seed renters and update individual room status
    console.log('\nSeeding renters...');
    for (const renter of data.renters) {
      try {
        const existingRenter = await prisma.renter.findFirst({
          where: {
            renterEmail: renter.renterEmail,
            ktpNumber: renter.ktpNumber
          }
        });

        if (!existingRenter) {
          await prisma.renter.create({
            data: {
              ...renter,
              joinDate: new Date(renter.joinDate),
              leaveDate: new Date(renter.leaveDate),
            },
          });

          if (!renter.hasLeaved) {
            await prisma.individualRoom.update({
              where: { id: renter.individualRoomId },
              data: { status: 'Rented' },
            });
          }

          console.log(`Created renter: ${renter.renterName}`);
        } else {
          console.log(`Skipping duplicate renter: ${renter.renterName}`);
        }
      } catch (error) {
        console.error(`Error processing renter ${renter.renterName}:`, error);
      }
    }

    // Seed renter expenses
    console.log('\nSeeding renter expenses...');
    for (const expense of data.renterexpenses) {
      try {
        await prisma.renterExpenses.create({
          data: {
            ...expense,
            serviceDate: new Date(expense.serviceDate),
            lastPaymentDate: new Date(expense.lastPaymentDate),
          },
        });
        console.log(`Created expense for renter ID: ${expense.renterId}`);
      } catch (error) {
        console.error(`Error processing expense for renter ID ${expense.renterId}:`, error);
      }
    }

    // Seed renter transactions with unique orderIds
    console.log('\nSeeding renter transactions...');
    for (const transaction of data.rentertransactions) {
      try {
        await prisma.renterTransaction.create({
          data: {
            ...transaction,
            orderId: `${transaction.orderId}-${transaction.renterId}`,
            createdAt: new Date(transaction.createdAt),
            dueDate: new Date(transaction.dueDate),
            paidAt: transaction.paidAt ? new Date(transaction.paidAt) : null,
          },
        });
        console.log(`Created transaction for renter ID: ${transaction.renterId}`);
      } catch (error) {
        console.error(`Error processing transaction for renter ID ${transaction.renterId}:`, error);
      }
    }

    console.log('\nSeeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });