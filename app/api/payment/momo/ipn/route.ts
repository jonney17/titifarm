import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { MomoService, MomoCallbackData } from "@/app/lib/momo";

// IPN (Instant Payment Notification) endpoint cho Momo
export async function POST(req: NextRequest) {
  try {
    const callbackData: MomoCallbackData = await req.json();
    
    console.log("Received Momo IPN:", callbackData);

    // Xác thực chữ ký
    if (!MomoService.verifySignature(callbackData)) {
      console.error("Invalid Momo IPN signature");
      return NextResponse.json(
        { status: "FAILED", message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Parse extraData để lấy booking info
    let bookingCode = "";
    let bookingId = "";
    
    try {
      const extraData = JSON.parse(callbackData.extraData || "{}");
      bookingCode = extraData.bookingCode;
      bookingId = extraData.bookingId;
    } catch (e) {
      console.error("Failed to parse IPN extraData:", e);
      return NextResponse.json(
        { status: "FAILED", message: "Invalid extraData" },
        { status: 400 }
      );
    }

    if (!bookingCode) {
      console.error("Missing bookingCode in IPN extraData");
      return NextResponse.json(
        { status: "FAILED", message: "Missing bookingCode" },
        { status: 400 }
      );
    }

    // Tìm booking
    const booking = await prisma.booking.findUnique({
      where: { code: bookingCode },
    });

    if (!booking) {
      console.error("Booking not found in IPN:", bookingCode);
      return NextResponse.json(
        { status: "FAILED", message: "Booking not found" },
        { status: 404 }
      );
    }

    // Kiểm tra xem payment đã được xử lý chưa
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId: booking.id,
        provider: "MOMO",
        transactionId: callbackData.orderId,
      },
    });

    if (!existingPayment) {
      console.error("Payment not found for IPN:", callbackData.orderId);
      return NextResponse.json(
        { status: "FAILED", message: "Payment not found" },
        { status: 404 }
      );
    }

    // Nếu payment đã được xử lý thành công, không cần xử lý lại
    if (existingPayment.status === "SUCCEEDED") {
      console.log("Payment already processed:", callbackData.orderId);
      return NextResponse.json({ status: "OK" });
    }

    // Cập nhật payment status dựa trên kết quả từ Momo
    if (callbackData.resultCode === 0) {
      // Thanh toán thành công
      console.log("Processing successful payment:", callbackData.orderId);
      
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
            raw: {
              ...(existingPayment.raw as any),
              momoIPN: callbackData as any,
              ipnProcessedAt: new Date().toISOString(),
            },
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "PAID" },
        }),
      ]);
      
      console.log("Payment processed successfully:", callbackData.orderId);
    } else {
      // Thanh toán thất bại
      console.log("Processing failed payment:", callbackData.orderId, callbackData.message);
      
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "FAILED",
          raw: {
            ...(existingPayment.raw as any),
            momoIPN: callbackData as any,
            ipnProcessedAt: new Date().toISOString(),
          },
        },
      });
    }

    // Trả về response thành công cho Momo
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Momo IPN processing error:", error);
    return NextResponse.json(
      { status: "FAILED", message: "Processing error" },
      { status: 500 }
    );
  }
}
