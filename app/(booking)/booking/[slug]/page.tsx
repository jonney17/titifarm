import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import BookingFormClient from "./BookingFormClient";

type Props = { params: Promise<{ slug: string }> };

export default async function BookingPage({ params }: Props) {
  const { slug } = await params;
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: { departures: { where: { isActive: true }, orderBy: { date: "asc" }, take: 10 } },
  });
  if (!tour) return notFound();

  return (
    <div className="py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Đặt tour: {tour.title}</h1>
      <BookingFormClient
        tourId={tour.id}
        departures={tour.departures.map((d) => ({ id: d.id, date: d.date.toISOString?.() ?? String(d.date) }))}
      />
    </div>
  );
}


