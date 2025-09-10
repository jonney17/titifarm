import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

type Props = { 
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BookingConfirmPage({ params, searchParams }: Props) {
  const { code } = await params;
  const search = await searchParams;
  
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: { tour: true, departure: true, payments: true },
  });
  if (!booking) return <div className="py-8">Không tìm thấy đơn.</div>;

  // Check payment status from URL params
  const paymentStatus = search.payment as string;
  const isSimulated = search.simulated === 'true';
  const paymentReason = search.reason as string;

  return (
    <div className="py-8 max-w-2xl mx-auto px-4">
      {/* Payment Status Alert */}
      {paymentStatus && (
        <div className={`rounded-lg p-4 mb-6 ${
          paymentStatus === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl ${paymentStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {paymentStatus === 'success' ? '✅' : '❌'}
            </span>
            <div>
              <h3 className={`font-medium ${paymentStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {paymentStatus === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </h3>
              <p className={`text-sm ${paymentStatus === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {paymentStatus === 'success' 
                  ? 'Cảm ơn bạn đã thanh toán. Tour đã được xác nhận!' 
                  : `Lỗi: ${paymentReason || 'Vui lòng thử lại hoặc chọn phương thức khác'}`
                }
              </p>
              {isSimulated && (
                <p className="text-xs text-gray-600 mt-1">
                  🎮 Đây là demo simulation - không có tiền thật được chuyển
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">
        {booking.status === "PAID" ? "Xác Nhận Đặt Tour" : "Đơn Hàng Đã Tạo"}
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-3">Thông tin đặt tour</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Mã đơn hàng</div>
              <div className="font-mono text-lg">{booking.code}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Trạng thái</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "PAID" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {booking.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">Tour:</span>
            <div className="font-medium">{booking.tour.title}</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Ngày khởi hành:</span>
            <div>{booking.departure ? new Date(booking.departure.date).toLocaleDateString("vi-VN") : "Chưa chọn"}</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Số khách:</span>
            <div>{booking.numGuests} người</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Tổng tiền:</span>
            <div className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(booking.totalAmountVnd)}₫
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {booking.payments && booking.payments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin thanh toán</h3>
            {booking.payments.map((payment) => (
              <div key={payment.id} className="text-sm text-gray-600 space-y-1">
                <div>Phương thức: {payment.provider}</div>
                <div>Trạng thái: {payment.status}</div>
                {payment.paidAt && <div>Thanh toán lúc: {new Date(payment.paidAt).toLocaleString("vi-VN")}</div>}
                {isSimulated && (
                  <div className="text-blue-600">💡 Demo simulation mode</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {booking.status !== "PAID" && (
          <Link
            href={`/payment/checkout/${booking.code}`}
            className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Thanh toán ngay
          </Link>
        )}
        
        <div className="flex space-x-3">
          <Link 
            href={`/tours/${booking.tour.slug}`} 
            className="flex-1 text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Xem tour
          </Link>
          <Link 
            href="/tours" 
            className="flex-1 text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Các tour khác
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {booking.status === "PAID" && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">🎉 Chúc mừng!</h4>
          <p className="text-blue-700 text-sm">
            Tour của bạn đã được xác nhận. Chúng tôi sẽ liên hệ sớm để trao đổi chi tiết.
          </p>
          {isSimulated && (
            <p className="text-xs text-blue-600 mt-2">
              🎮 Đây là demo - trong thực tế, bạn sẽ nhận email xác nhận và hướng dẫn chi tiết.
            </p>
          )}
        </div>
      )}
    </div>
  );
}


