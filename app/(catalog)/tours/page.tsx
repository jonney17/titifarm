import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Các hoạt động tại TitiFarm</h1>
      <p className="text-gray-600 mb-6">Chọn gói trải nghiệm tại nông trại của chúng tôi. Đặt chỗ trực tuyến, xác nhận ngay.</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((t) => (
          <Link key={t.id} href={`/tours/${t.slug}`} className="border rounded overflow-hidden hover:shadow">
            <div className="relative w-full pt-[66.666%] bg-gray-100">
              {t.images[0]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.images[0].url} alt={t.images[0].alt ?? t.title} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <div className="font-medium mt-1">{t.title}</div>
              <div className="text-sm mt-2">Giá từ {new Intl.NumberFormat("vi-VN").format(t.basePrice)}₫</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


