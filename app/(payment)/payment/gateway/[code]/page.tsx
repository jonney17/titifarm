import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ code: string }> };

export default async function PaymentGatewayDemo({ params }: Props) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({ where: { code } });
  if (!booking) return notFound();

  return (
    <div className="py-8 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Cổng thanh toán (demo)</h1>
      <p className="mb-4">Thanh toán đơn {booking.code} số tiền {new Intl.NumberFormat("vi-VN").format(booking.totalAmountVnd)}₫</p>
      <div className="space-x-3">
        <Link href={`/api/payment/callback?code=${booking.code}&status=success`} className="bg-green-600 text-white rounded px-4 py-2 inline-block">Giả lập thành công</Link>
        <Link href={`/api/payment/callback?code=${booking.code}&status=fail`} className="bg-red-600 text-white rounded px-4 py-2 inline-block">Giả lập thất bại</Link>
      </div>
    </div>
  );
}


