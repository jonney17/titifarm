import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = String(form.get("title") ?? "");
  const description = String(form.get("description") ?? "");
  const slug = String(form.get("slug") ?? "");
  const basePrice = Number(form.get("basePrice") ?? 0);
  const file = form.get("imageFile") as File | null;

  if (!title || !description || !slug || !Number.isFinite(basePrice) || !file) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  // Upload to Vercel Blob (public read)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.name?.split(".").pop() ? `.${file.name.split(".").pop()}` : ".png").toLowerCase();
  const filename = `${slug}-${Date.now()}${ext}`;
  const { url: publicUrl } = await put(filename, buffer, { access: "public" });

  // Ensure a default destination exists (TitiFarm)
  const defaultDest = await prisma.destination.upsert({
    where: { slug: "titifarm" },
    update: {},
    create: { slug: "titifarm", name: "TitiFarm" },
  });

  await prisma.tour.create({
    data: {
      title,
      description,
      slug,
      basePrice,
      destinationId: defaultDest.id,
      images: { create: [{ url: publicUrl, sortOrder: 0 }] },
    },
  });

  return NextResponse.redirect(new URL("/admin/tours", req.url));
}


