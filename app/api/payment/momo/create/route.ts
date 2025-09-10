import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { MomoService } from "@/app/lib/momo";

export async function POST(req: NextRequest) {
  try {
    const { bookingCode } = await req.json();

    if (!bookingCode) {
      return NextResponse.json(
        { error: "Booking code is required" },
        { status: 400 }
      );
    }

    // Tìm booking
    const booking = await prisma.booking.findUnique({
      where: { code: bookingCode },
      include: { tour: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "PAID") {
      return NextResponse.json(
        { error: "Booking already paid" },
        { status: 400 }
      );
    }

    // Tạo hoặc update payment record
    const orderId = `MOMO_${booking.code}_${Date.now()}`;
    const requestId = `REQ_${Date.now()}`;

    await prisma.payment.upsert({
      where: {
        bookingId_provider: {
          bookingId: booking.id,
          provider: "MOMO",
        },
      },
      update: {
        status: "PENDING",
        transactionId: orderId,
        raw: {
          orderId,
          requestId,
          momoRequestTime: new Date().toISOString(),
        },
      },
      create: {
        bookingId: booking.id,
        provider: "MOMO",
        amountVnd: booking.totalAmountVnd,
        status: "PENDING",
        transactionId: orderId,
        raw: {
          orderId,
          requestId,
          momoRequestTime: new Date().toISOString(),
        },
      },
    });

    // Tạo Momo payment request
    const momoRequest = {
      amount: booking.totalAmountVnd,
      orderInfo: `Thanh toán tour ${booking.tour.title} - ${booking.code}`,
      orderId,
      requestId,
      extraData: JSON.stringify({
        bookingCode: booking.code,
        bookingId: booking.id,
      }),
      userInfo: {
        name: booking.customerName,
        phoneNumber: booking.customerPhone || "",
        email: booking.customerEmail,
      },
    };

    const momoResponse = await MomoService.createPayment(momoRequest);

    // Cập nhật payment với response từ Momo
    await prisma.payment.updateMany({
      where: {
        bookingId: booking.id,
        provider: "MOMO",
        status: "PENDING",
      },
      data: {
        raw: {
          ...momoRequest,
          momoResponse,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payUrl: momoResponse.payUrl,
        qrCodeUrl: momoResponse.qrCodeUrl,
        deeplink: momoResponse.deeplink,
        orderId: momoResponse.orderId,
        amount: momoResponse.amount,
      },
    });
  } catch (error) {
    console.error("Momo payment creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create Momo payment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
