import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function OrdersPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      tour: true,
      payments: {
        orderBy: { createdAt: "desc" }
      }
    },
  });

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>
      <div className="space-y-4">
        {bookings.map((b) => {
          const latestPayment = b.payments[0]; // Latest payment
          const isSimulated = latestPayment?.raw && (latestPayment.raw as any)?.demoMode;
          
          return (
            <Link key={b.id} href={`/booking/confirm/${b.code}`} className="block">
              <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-sm text-gray-500 font-mono">#{b.code}</div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === "PAID" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {b.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                      </div>
                      {isSimulated && (
                        <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🎮 Demo
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-lg text-gray-900 mb-1">{b.tour.title}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {b.numGuests} khách · {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                    
                    {/* Payment Info */}
                    {latestPayment && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Thanh toán:</span>
                          <div className="flex items-center gap-1">
                            {latestPayment.provider === "MOMO" && (
                              <div className="w-5 h-5 bg-pink-100 rounded flex items-center justify-center">
                                <span className="text-pink-600 font-bold text-xs">M</span>
                              </div>
                            )}
                            <span className="font-medium">
                              {latestPayment.provider === "MOMO" ? "Ví MoMo" : latestPayment.provider}
                            </span>
                          </div>
                        </div>
                        {latestPayment.paidAt && (
                          <div className="text-gray-500">
                            {new Date(latestPayment.paidAt).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {new Intl.NumberFormat("vi-VN").format(b.totalAmountVnd)}₫
                    </div>
                    {latestPayment && latestPayment.status === "SUCCEEDED" && (
                      <div className="text-sm text-green-600 font-medium">
                        ✅ Thanh toán thành công
                      </div>
                    )}
                    {latestPayment && latestPayment.status === "FAILED" && (
                      <div className="text-sm text-red-600 font-medium">
                        ❌ Thanh toán thất bại
                      </div>
                    )}
                    {(!latestPayment || latestPayment.status === "PENDING") && (
                      <div className="text-sm text-yellow-600 font-medium">
                        ⏳ Chờ thanh toán
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Multiple payments info */}
                {b.payments.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      {b.payments.length} lần thanh toán · 
                      <span className="ml-1">
                        {b.payments.filter(p => p.status === "SUCCEEDED").length} thành công, {" "}
                        {b.payments.filter(p => p.status === "FAILED").length} thất bại, {" "}
                        {b.payments.filter(p => p.status === "PENDING").length} đang chờ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Chưa có đơn hàng nào</div>
            <Link 
              href="/tours" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Khám phá tour
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


