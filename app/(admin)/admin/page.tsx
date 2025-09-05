import { prisma } from "@/app/lib/prisma";

export default async function AdminDashboardPage() {
  const [bookings, revenue] = await Promise.all([
    prisma.booking.count(),
    prisma.payment.aggregate({ _sum: { amountVnd: true }, where: { status: "SUCCEEDED" } }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border rounded p-4">
        <div className="text-sm text-gray-500">Tổng số booking</div>
        <div className="text-2xl font-semibold">{bookings}</div>
      </div>
      <div className="border rounded p-4">
        <div className="text-sm text-gray-500">Doanh thu</div>
        <div className="text-2xl font-semibold">{new Intl.NumberFormat("vi-VN").format(revenue._sum.amountVnd ?? 0)}₫</div>
      </div>
    </div>
  );
}
