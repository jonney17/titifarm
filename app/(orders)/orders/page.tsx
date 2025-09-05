import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function OrdersPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { tour: true },
  });

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>
      <div className="space-y-3">
        {bookings.map((b) => (
          <Link key={b.id} href={`/booking/confirm/${b.code}`} className="block border rounded p-4 hover:shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Mã: {b.code}</div>
                <div className="font-medium">{b.tour.title}</div>
              </div>
              <div className="text-sm text-gray-600">
                {new Intl.NumberFormat("vi-VN").format(b.totalAmountVnd)}₫ · {b.status}
              </div>
            </div>
          </Link>
        ))}
        {bookings.length === 0 && <div>Chưa có đơn nào.</div>}
      </div>
    </div>
  );
}


