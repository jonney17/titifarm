import Link from "next/link";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PaymentErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const reason = params.reason || "unknown";

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case "invalid_signature":
        return "Chữ ký không hợp lệ. Vui lòng thử lại.";
      case "booking_not_found":
        return "Không tìm thấy thông tin đặt tour.";
      case "processing_error":
        return "Có lỗi xảy ra trong quá trình xử lý thanh toán.";
      default:
        return "Có lỗi không xác định xảy ra.";
    }
  };

  const getErrorTitle = (reason: string) => {
    switch (reason) {
      case "invalid_signature":
        return "Lỗi xác thực";
      case "booking_not_found":
        return "Không tìm thấy đơn hàng";
      case "processing_error":
        return "Lỗi xử lý";
      default:
        return "Lỗi thanh toán";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getErrorTitle(reason as string)}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {getErrorMessage(reason as string)}
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">Chi tiết lỗi:</h3>
            <p className="text-sm text-red-700">Mã lỗi: {reason}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/tours"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Quay về trang chủ
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Quay lại trang trước
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Cần hỗ trợ?</h3>
            <p className="text-sm text-gray-600">
              Nếu bạn gặp vấn đề, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>📞 Hotline: 1900-xxx-xxx</p>
              <p>📧 Email: support@titifarm.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
