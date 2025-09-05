import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

type Props = { params: Promise<{ code: string }> };

export default async function BookingConfirmPage({ params }: Props) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: { tour: true, departure: true },
  });
  if (!booking) return <div className="py-8">Không tìm thấy đơn.</div>;

  return (
    <div className="py-8 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Đơn hàng đã tạo</h1>
      <div className="border rounded p-4 space-y-2">
        <div className="text-sm text-gray-500">Mã đơn</div>
        <div className="font-mono">{booking.code}</div>
        <div className="mt-2"><span className="text-sm text-gray-500">Tour:</span> {booking.tour.title}</div>
        <div><span className="text-sm text-gray-500">Ngày:</span> {booking.departure ? new Date(booking.departure.date).toLocaleDateString("vi-VN") : "-"}</div>
        <div><span className="text-sm text-gray-500">Số khách:</span> {booking.numGuests}</div>
        <div><span className="text-sm text-gray-500">Tổng tiền:</span> {new Intl.NumberFormat("vi-VN").format(booking.totalAmountVnd)}₫</div>
        <div><span className="text-sm text-gray-500">Trạng thái:</span> {booking.status}</div>
      </div>
      {booking.status !== "PAID" && (
        <Link
          href={`/payment/checkout/${booking.code}`}
          className="inline-block mt-4 bg-black text-white rounded px-4 py-2"
        >
          Thanh toán ngay
        </Link>
      )}
      <Link href={`/tours/${booking.tour.slug}`} className="inline-block mt-4 ml-3 underline">Quay lại tour</Link>
    </div>
  );
}


