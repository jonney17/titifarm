import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ code: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({ where: { code } });
  if (!booking) return redirect("/tours");

  // Demo: tạo payment record trạng thái PENDING và dẫn tới trang "cổng"
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "MANUAL",
      amountVnd: booking.totalAmountVnd,
      status: "PENDING",
    },
  });

  redirect(`/payment/gateway/${code}`);
}


