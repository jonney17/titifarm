import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import MomoPaymentForm from "./MomoPaymentForm";

type Props = { params: Promise<{ code: string }> };

export default async function PaymentGatewayPage({ params }: Props) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: { tour: true }
  });
  
  if (!booking) return notFound();

  return (
    <div className="py-8 max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Thanh toán đặt tour</h1>
        
        {/* Thông tin đơn hàng */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Thông tin đơn hàng</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Mã đơn:</span>
              <span className="font-mono">{booking.code}</span>
            </div>
            <div className="flex justify-between">
              <span>Tour:</span>
              <span>{booking.tour.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span>{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Số khách:</span>
              <span>{booking.numGuests} người</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Tổng tiền:</span>
              <span className="text-blue-600">
                {new Intl.NumberFormat("vi-VN").format(booking.totalAmountVnd)}₫
              </span>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-4">Chọn phương thức thanh toán</h2>
          
          {/* Momo QR Payment */}
          <MomoPaymentForm booking={booking} />
        </div>
      </div>
    </div>
  );
}


