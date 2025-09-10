import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { MomoService, MomoCallbackData } from "@/app/lib/momo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Lấy tất cả parameters từ callback
  const callbackData: MomoCallbackData = {
    partnerCode: searchParams.get("partnerCode") || "",
    orderId: searchParams.get("orderId") || "",
    requestId: searchParams.get("requestId") || "",
    amount: parseInt(searchParams.get("amount") || "0"),
    orderInfo: searchParams.get("orderInfo") || "",
    orderType: searchParams.get("orderType") || "",
    transId: parseInt(searchParams.get("transId") || "0"),
    resultCode: parseInt(searchParams.get("resultCode") || "-1"),
    message: searchParams.get("message") || "",
    payType: searchParams.get("payType") || "",
    responseTime: parseInt(searchParams.get("responseTime") || "0"),
    extraData: searchParams.get("extraData") || "",
    signature: searchParams.get("signature") || "",
  };

  try {
    // Xác thực chữ ký
    if (!MomoService.verifySignature(callbackData)) {
      console.error("Invalid Momo signature");
      return NextResponse.redirect(new URL("/payment/error?reason=invalid_signature", req.url));
    }

    // Parse extraData để lấy booking info
    let bookingCode = "";
    let bookingId = "";
    
    try {
      const extraData = JSON.parse(callbackData.extraData || "{}");
      bookingCode = extraData.bookingCode;
      bookingId = extraData.bookingId;
    } catch (e) {
      console.error("Failed to parse extraData:", e);
    }

    // Tìm booking
    const booking = await prisma.booking.findUnique({
      where: { code: bookingCode },
    });

    if (!booking) {
      console.error("Booking not found:", bookingCode);
      return NextResponse.redirect(new URL("/payment/error?reason=booking_not_found", req.url));
    }

    // Cập nhật payment status
    if (callbackData.resultCode === 0) {
      // Thanh toán thành công
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: {
            bookingId: booking.id,
            provider: "MOMO",
            status: "PENDING",
          },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
            raw: {
              momoCallback: callbackData as any,
              updatedAt: new Date().toISOString(),
            },
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "PAID" },
        }),
      ]);

      // Redirect về trang xác nhận thành công
      return NextResponse.redirect(new URL(`/booking/confirm/${booking.code}?payment=success`, req.url));
    } else {
      // Thanh toán thất bại
      await prisma.payment.updateMany({
        where: {
          bookingId: booking.id,
          provider: "MOMO",
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          raw: {
            momoCallback: callbackData as any,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // Redirect về trang thất bại
      return NextResponse.redirect(new URL(`/booking/confirm/${booking.code}?payment=failed&reason=${callbackData.message}`, req.url));
    }
  } catch (error) {
    console.error("Momo callback processing error:", error);
    return NextResponse.redirect(new URL("/payment/error?reason=processing_error", req.url));
  }
}

// POST handler cho IPN (Instant Payment Notification)
export async function POST(req: NextRequest) {
  try {
    const callbackData: MomoCallbackData = await req.json();

    // Xác thực chữ ký
    if (!MomoService.verifySignature(callbackData)) {
      console.error("Invalid Momo IPN signature");
      return NextResponse.json({ status: "FAILED", message: "Invalid signature" }, { status: 400 });
    }

    // Parse extraData
    let bookingCode = "";
    try {
      const extraData = JSON.parse(callbackData.extraData || "{}");
      bookingCode = extraData.bookingCode;
    } catch (e) {
      console.error("Failed to parse IPN extraData:", e);
      return NextResponse.json({ status: "FAILED", message: "Invalid extraData" }, { status: 400 });
    }

    // Tìm booking
    const booking = await prisma.booking.findUnique({
      where: { code: bookingCode },
    });

    if (!booking) {
      console.error("Booking not found in IPN:", bookingCode);
      return NextResponse.json({ status: "FAILED", message: "Booking not found" }, { status: 404 });
    }

    // Cập nhật payment status (chỉ khi chưa được xử lý)
    if (callbackData.resultCode === 0) {
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: {
            bookingId: booking.id,
            provider: "MOMO",
            status: "PENDING",
          },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
            raw: {
              momoIPN: callbackData,
              updatedAt: new Date().toISOString(),
            },
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "PAID" },
        }),
      ]);
    } else {
      await prisma.payment.updateMany({
        where: {
          bookingId: booking.id,
          provider: "MOMO",
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          raw: {
            momoIPN: callbackData,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    }

    // Trả về response cho Momo
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Momo IPN processing error:", error);
    return NextResponse.json({ status: "FAILED", message: "Processing error" }, { status: 500 });
  }
}
