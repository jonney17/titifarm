import { NextRequest, NextResponse } from "next/server";
// Auth temporarily disabled
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {

  const form = await req.formData();
  const tourId = String(form.get("tourId") ?? "");
  const rating = Number(form.get("rating") ?? 5);
  const content = String(form.get("content") ?? "");

  if (!tourId || !Number.isFinite(rating)) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  await prisma.review.create({
    data: { tourId, rating: Math.max(1, Math.min(5, rating)), content },
  });

  return NextResponse.redirect(new URL(`/tours/${(await prisma.tour.findUnique({ where: { id: tourId } }))?.slug ?? "tours"}`, req.url));
}


