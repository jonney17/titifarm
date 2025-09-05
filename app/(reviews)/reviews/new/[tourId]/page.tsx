// Auth temporarily disabled
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tourId: string }> };

export default async function NewReviewPage({ params }: Props) {
  const { tourId } = await params;
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) return notFound();

  // Skip check paid booking when auth disabled

  return (
    <div className="max-w-xl py-8">
      <h1 className="text-xl font-semibold mb-4">Đánh giá: {tour.title}</h1>
      <form action="/reviews/new/action" method="post" className="space-y-3">
        <input type="hidden" name="tourId" value={tour.id} />
        <input type="number" name="rating" min={1} max={5} defaultValue={5} className="w-full border rounded px-3 py-2" />
        <textarea name="content" placeholder="Cảm nhận của bạn" className="w-full border rounded px-3 py-2" />
        <button className="bg-black text-white rounded px-4 py-2">Gửi đánh giá</button>
      </form>
    </div>
  );
}


