import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { generateBookingCode } from "@/app/lib/codes";
// Auth temporarily disabled

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tourId = String(form.get("tourId") ?? "");
  const departureSlotId = String(form.get("departureSlotId") ?? "");
  const numGuests = Number(form.get("numGuests") ?? 1);
  const customerName = String(form.get("customerName") ?? "");
  const customerEmail = String(form.get("customerEmail") ?? "");
  const customerPhone = String(form.get("customerPhone") ?? "");

  if (!tourId || !departureSlotId || !customerName || !customerEmail || !Number.isFinite(numGuests) || numGuests < 1) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  const slot = await prisma.departureSlot.findUnique({ where: { id: departureSlotId } });
  if (!tour || !slot || slot.tourId !== tour.id || !slot.isActive) {
    return NextResponse.json({ error: "INVALID_TOUR_OR_SLOT" }, { status: 400 });
  }
  const remaining = slot.capacity - slot.booked;
  if (remaining < numGuests) {
    return NextResponse.json({ error: "NOT_ENOUGH_SEATS" }, { status: 409 });
  }

  const unitPrice = slot.priceVnd ?? tour.basePrice;
  const totalAmountVnd = unitPrice * numGuests;

  // derive userId from session email if available
  const userId: string | undefined = undefined;

  const booking = await prisma.$transaction(async (tx) => {
    // optimistic capacity check and increment
    const updated = await tx.departureSlot.update({
      where: { id: slot.id },
      data: { booked: { increment: numGuests } },
    });
    if (updated.booked > updated.capacity) {
      throw new Error("OVERBOOKED");
    }
    const created = await tx.booking.create({
      data: {
        code: generateBookingCode(),
        tourId: tour.id,
        departureSlotId: slot.id,
        customerName,
        customerEmail,
        customerPhone,
        numGuests,
        totalAmountVnd,
        status: "PENDING",
        userId,
      },
    });
    return created;
  });

  return NextResponse.redirect(new URL(`/booking/confirm/${booking.code}`, req.url));
}


