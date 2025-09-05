import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@titifarm.local" },
    update: { role: "ADMIN" },
    create: { email: "admin@titifarm.local", name: "Admin", role: "ADMIN" },
  });
  const daLat = await prisma.destination.upsert({
    where: { slug: "da-lat" },
    update: {},
    create: { name: "Đà Lạt", slug: "da-lat" },
  });

  const tour = await prisma.tour.upsert({
    where: { slug: "tour-nong-trai-cho-tre-em" },
    update: {},
    create: {
      slug: "tour-nong-trai-cho-tre-em",
      title: "Tour nông trại dành cho trẻ em",
      description: "Trải nghiệm tham quan nông trại, cho thú ăn, thu hoạch rau.",
      basePrice: 250000,
      durationDays: 1,
      type: "KIDS",
      destinationId: daLat.id,
      images: {
        create: [
          { url: "https://picsum.photos/seed/farm1/800/500", alt: "Nông trại" },
          { url: "https://picsum.photos/seed/farm2/800/500", alt: "Vườn rau" },
        ],
      },
    },
    include: { images: true },
  });

  const today = new Date();
  const addDays = (d: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);

  for (const d of [3, 10, 17]) {
    await prisma.departureSlot.upsert({
      where: { tourId_date: { tourId: tour.id, date: addDays(d) } },
      update: {},
      create: {
        tourId: tour.id,
        date: addDays(d),
        capacity: 30,
        booked: 0,
        priceVnd: 250000,
        isActive: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


