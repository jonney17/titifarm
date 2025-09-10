import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ code: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({ where: { code } });
  if (!booking) return redirect("/tours");

  // Redirect tới trang chọn phương thức thanh toán
  redirect(`/payment/gateway/${code}`);
}


