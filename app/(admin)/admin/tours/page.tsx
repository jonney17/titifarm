import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({ include: { destination: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tours</h2>
        <Link href="/admin/tours/new" className="bg-black text-white rounded px-3 py-2 text-sm">Tạo tour</Link>
      </div>
      <div className="divide-y border rounded">
        {tours.map((t) => (
          <div key={t.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-gray-500">{t.destination.name} · {t.slug}</div>
            </div>
            <Link href={`/admin/tours/${t.id}`} className="underline text-sm">Sửa</Link>
          </div>
        ))}
        {tours.length === 0 && <div className="p-3">Chưa có tour nào.</div>}
      </div>
    </div>
  );
}
