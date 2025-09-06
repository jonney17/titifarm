import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { generateBookingCode } from "@/app/lib/codes";
// Auth temporarily disabled

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tourId = String(form.get("tourId") ?? "");
  const departureSlotId = String(form.get("departureSlotId") ?? "");
  const dateStr = String(form.get("date") ?? "");
  const numGuests = Number(form.get("numGuests") ?? 1);
  const customerName = String(form.get("customerName") ?? "");
  const customerEmail = String(form.get("customerEmail") ?? "");
  const customerPhone = String(form.get("customerPhone") ?? "");

  if (!tourId || !customerName || !customerEmail || !Number.isFinite(numGuests) || numGuests < 1) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) {
    return NextResponse.json({ error: "INVALID_TOUR" }, { status: 400 });
  }

  // Find or create a slot by date if not provided, ignoring capacity
  let slot = null as null | { id: string; priceVnd: number | null };
  if (departureSlotId) {
    const found = await prisma.departureSlot.findUnique({ where: { id: departureSlotId } });
    if (found && found.tourId === tour.id && found.isActive) {
      slot = { id: found.id, priceVnd: found.priceVnd };
    }
  }
  if (!slot && dateStr) {
    const date = new Date(dateStr);
    // try existing
    const existing = await prisma.departureSlot.findFirst({ where: { tourId: tour.id, date } });
    if (existing) {
      slot = { id: existing.id, priceVnd: existing.priceVnd };
    } else {
      const created = await prisma.departureSlot.create({
        data: { tourId: tour.id, date, capacity: 1000000, isActive: true },
      });
      slot = { id: created.id, priceVnd: created.priceVnd };
    }
  }
  if (!slot) {
    return NextResponse.json({ error: "MISSING_SLOT_OR_DATE" }, { status: 400 });
  }
  // Ignore capacity entirely

  const unitPrice = slot.priceVnd ?? tour.basePrice;
  const totalAmountVnd = unitPrice * numGuests;

  // derive userId from session email if available
  const userId: string | undefined = undefined;

  const booking = await prisma.$transaction(async (tx) => {
    // optimistic capacity check and increment
    await tx.departureSlot.update({
      where: { id: slot.id },
      data: { booked: { increment: numGuests } },
    });
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


