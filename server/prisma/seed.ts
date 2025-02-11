import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { hashPassword } from '../src/helpers/bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the combined JSON data
    const data = JSON.parse(readFileSync('data.json', 'utf-8'));

    // Seed users first with duplicate checking
    console.log('Seeding users...');
    for (const user of data.users) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          user.password = await hashPassword(user.password);
          await prisma.user.create({
            data: user,
          });
          console.log(`Created user: ${user.email}`);
        } else {
          console.log(`Skipping duplicate user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    // Seed properties with error handling
    console.log('\nSeeding properties...');
    for (const property of data.properties) {
      try {
        const existingProperty = await prisma.property.findFirst({
          where: {
            propertyName: property.propertyName,
          }
        });

        if (!existingProperty) {
          await prisma.property.create({
            data: property,
          });
          console.log(`Created property: ${property.propertyName}`);
        } else {
          console.log(`Skipping duplicate property: ${property.propertyName}`);
        }
      } catch (error) {
        console.error(`Error processing property ${property.propertyName}:`, error);
      }
    }

    // Seed rooms and create individual rooms with error handling
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
          console.log(`Created room type: ${room.typeName}`);
        } else {
          console.log(`Skipping duplicate room type: ${room.typeName}`);
        }
      } catch (error) {
        console.error(`Error processing room ${room.typeName}:`, error);
      }
    }

    // Seed renters with error handling
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
          // Find the room based on property and type
          const room = await prisma.room.findFirst({
            where: {
              propertyId: renter.propertyId,
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
          console.log(`Created renter: ${renter.renterName}`);
        } else {
          console.log(`Skipping duplicate renter: ${renter.renterName}`);
        }
      } catch (error) {
        console.error(`Error processing renter ${renter.renterName}:`, error);
      }
    }

    // Seed renter expenses with error handling
    console.log('\nSeeding renter expenses...');
    for (const renterExpense of data.renterexpenses) {
      try {
        await prisma.renterExpenses.create({
          data: {
            ...renterExpense,
            serviceDate: new Date(renterExpense.serviceDate),
            lastPaymentDate: new Date(renterExpense.lastPaymentDate),
          },
        });
        console.log(`Created expense for renter ID: ${renterExpense.renterId}`);
      } catch (error) {
        console.error(`Error processing expense for renter ID ${renterExpense.renterId}:`, error);
      }
    }

    // Seed renter transactions with error handling
    console.log('\nSeeding renter transactions...');
    for (const renterTransaction of data.rentertransactions) {
      try {
        await prisma.renterTransaction.create({
          data: {
            ...renterTransaction,
            createdAt: new Date(renterTransaction.createdAt),
          },
        });
        console.log(`Created transaction for renter ID: ${renterTransaction.renterId}`);
      } catch (error) {
        console.error(`Error processing transaction for renter ID ${renterTransaction.renterId}:`, error);
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
    throw new Error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });