import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const status = searchParams.get("status");
  if (!code) return NextResponse.json({ error: "MISSING_CODE" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { code } });
  if (!booking) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (status === "success") {
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { bookingId: booking.id, status: "PENDING" },
        data: { status: "SUCCEEDED", paidAt: new Date() },
      }),
      prisma.booking.update({ where: { id: booking.id }, data: { status: "PAID" } }),
    ]);
  } else if (status === "fail") {
    await prisma.payment.updateMany({ where: { bookingId: booking.id, status: "PENDING" }, data: { status: "FAILED" } });
  }

  return NextResponse.redirect(new URL(`/booking/confirm/${code}`, req.url));
}


