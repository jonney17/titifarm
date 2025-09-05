import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

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
      <form action={`/api/booking`} method="post" className="space-y-4">
        <input type="hidden" name="tourId" value={tour.id} />
        <label className="block">
          <span className="text-sm">Chọn ngày khởi hành</span>
          <select name="departureSlotId" required className="w-full border rounded px-3 py-2 mt-1">
            {tour.departures.map((d) => (
              <option key={d.id} value={d.id}>
                {new Date(d.date).toLocaleDateString("vi-VN")} (còn {d.capacity - d.booked} chỗ)
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Số khách</span>
          <input name="numGuests" type="number" min={1} defaultValue={1} className="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Họ tên</span>
            <input name="customerName" required className="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label className="block">
            <span className="text-sm">Email</span>
            <input name="customerEmail" type="email" required className="w-full border rounded px-3 py-2 mt-1" />
          </label>
        </div>
        <label className="block">
          <span className="text-sm">Số điện thoại</span>
          <input name="customerPhone" className="w-full border rounded px-3 py-2 mt-1" />
        </label>
        <button className="bg-black text-white rounded px-4 py-2">Tạo đơn</button>
      </form>
    </div>
  );
}


