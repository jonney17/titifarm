"use client";

import { useState } from "react";
import Image from "next/image";

interface Booking {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmountVnd: number;
  tour: {
    id: string;
    title: string;
  };
}

interface MomoPaymentFormProps {
  booking: Booking;
}

export default function MomoPaymentForm({ booking }: MomoPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleMomoPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/momo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingCode: booking.code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Có lỗi xảy ra khi tạo thanh toán");
      }

      if (result.success && result.data) {
        setPaymentData(result.data);
        
        // Redirect đến Momo app hoặc hiển thị QR code
        if (result.data.deeplink) {
          // Thử mở Momo app trước
          window.location.href = result.data.deeplink;
          
          // Fallback: sau 3 giây, hiển thị QR code nếu không mở được app
          setTimeout(() => {
            // QR code sẽ được hiển thị trong UI
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Momo payment error:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã copy vào clipboard!");
  };

  return (
    <div className="space-y-4">
      {/* Momo Payment Option */}
      <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-pink-100 rounded flex items-center justify-center">
            <span className="text-pink-600 font-bold text-sm">M</span>
          </div>
          <div>
            <h3 className="font-medium">Ví MoMo</h3>
            <p className="text-sm text-gray-600">Thanh toán bằng mã QR hoặc ứng dụng MoMo</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!paymentData ? (
          <button
            onClick={handleMomoPayment}
            disabled={isLoading}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tạo thanh toán...</span>
              </div>
            ) : (
              "Thanh toán với MoMo"
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* QR Code */}
            {paymentData.qrCodeUrl && (
              <div className="text-center">
                <h4 className="font-medium mb-3">Quét mã QR để thanh toán</h4>
                <div className="inline-block p-4 bg-white border rounded-lg">
                  <Image
                    src={paymentData.qrCodeUrl}
                    alt="Momo QR Code"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">
                    Mở ứng dụng MoMo → Quét mã QR → Xác nhận thanh toán
                  </p>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(paymentData.qrCodeUrl)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy link QR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <p className="font-mono">{paymentData.orderId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Số tiền:</span>
                  <p className="font-semibold text-green-600">
                    {new Intl.NumberFormat("vi-VN").format(paymentData.amount)}₫
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status Check */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Thanh toán sẽ được xác nhận tự động sau khi hoàn tất
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Kiểm tra lại trạng thái
              </button>
            </div>

            {/* Open Momo App Button */}
            {paymentData.deeplink && (
              <button
                onClick={() => window.location.href = paymentData.deeplink}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Mở ứng dụng MoMo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn thanh toán</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Chọn phương thức thanh toán MoMo</li>
          <li>2. Quét mã QR hoặc mở ứng dụng MoMo</li>
          <li>3. Xác nhận thông tin và hoàn tất thanh toán</li>
          <li>4. Hệ thống sẽ tự động xác nhận và chuyển hướng</li>
        </ul>
      </div>

      {/* Alternative Payment Methods */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Phương thức khác</h4>
        <div className="space-y-2">
          <button
            onClick={() => alert("Tính năng này sẽ được cập nhật sớm")}
            className="w-full text-left border rounded-lg p-3 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">V</span>
              </div>
              <div>
                <span className="font-medium">VNPay</span>
                <p className="text-sm text-gray-600">Thẻ ATM, Visa, Mastercard</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => alert("Vui lòng liên hệ: " + booking.customerPhone)}
            className="w-full text-left border rounded-lg p-3 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">💰</span>
              </div>
              <div>
                <span className="font-medium">Thanh toán trực tiếp</span>
                <p className="text-sm text-gray-600">Thanh toán khi nhận dịch vụ</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
