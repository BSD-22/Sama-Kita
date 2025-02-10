import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create individual rooms first
  const rooms = await prisma.room.findMany();

  for (const room of rooms) {
    await Promise.all(
      Array.from({ length: room.totalRooms }, (_, i) => {
        return prisma.individualRoom.create({
          data: {
            roomNumber: `${room.typeName}-${i + 1}`,
            status: 'Available',
            roomId: room.id,
          },
        });
      }),
    );
  }

  // Then update existing renters to point to individual rooms
  const renters = await prisma.renter.findMany();

  for (const renter of renters) {
    const individualRoom = await prisma.individualRoom.findFirst({
      where: {
        roomId: renter.roomId,
        status: 'Available',
      },
    });

    if (individualRoom) {
      await prisma.$transaction([
        prisma.renter.update({
          where: { id: renter.id },
          data: { individualRoomId: individualRoom.id },
        }),
        prisma.individualRoom.update({
          where: { id: individualRoom.id },
          data: { status: 'Rented' },
        }),
      ]);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
