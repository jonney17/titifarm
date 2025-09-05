import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      destination: true,
      departures: { where: { isActive: true }, orderBy: { date: "asc" }, take: 6 },
    },
  });

  if (!tour) return <div className="py-8">Không tìm thấy tour.</div>;

  return (
    <div className="py-8">
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/tours">TitiFarm</Link> / <span>Hoạt động</span>
      </div>
      <h1 className="text-2xl font-semibold mb-4">{tour.title}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {tour.images.map((img) => (
            <div key={img.id} className="relative w-full pt-[56.25%] overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? tour.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">{tour.description}</p>
        </div>
        <aside className="border rounded p-4 h-fit">
          <div className="text-sm text-gray-500">Giá từ</div>
          <div className="text-2xl font-semibold">{new Intl.NumberFormat("vi-VN").format(tour.basePrice)}₫</div>
          <div className="mt-4">
            <div className="font-medium mb-2">Ngày khởi hành gần nhất</div>
            <ul className="space-y-2">
              {tour.departures.map((d) => (
                <li key={d.id} className="text-sm flex items-center justify-between">
                  <span>{new Date(d.date).toLocaleDateString("vi-VN")}</span>
                  <span className="text-gray-500">Còn {d.capacity - d.booked} chỗ</span>
                </li>
              ))}
            </ul>
          </div>
          <Link href={`/booking/${tour.slug}`} className="mt-4 block text-center bg-black text-white rounded py-2">
            Đặt ngay
          </Link>
        </aside>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Đánh giá</h2>
        {/* Link tạo review sẽ kiểm tra booking PAID trong route */}
        <Link href={`/reviews/new/${tour.id}`} className="underline text-sm">Viết đánh giá</Link>
      </div>
    </div>
  );
}


