import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// API để giả lập thanh toán thành công/thất bại
export async function POST(req: NextRequest) {
  try {
    const { bookingCode, action } = await req.json();

    if (!bookingCode || !action) {
      return NextResponse.json(
        { error: "Missing bookingCode or action" },
        { status: 400 }
      );
    }

    // Tìm booking
    const booking = await prisma.booking.findUnique({
      where: { code: bookingCode },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Tìm hoặc tạo payment record
    let payment = await prisma.payment.findFirst({
      where: {
        bookingId: booking.id,
        provider: "MOMO",
        status: "PENDING",
      },
    });

    // Nếu chưa có payment record, tạo mới cho demo
    if (!payment) {
      const orderId = `MOMO_DEMO_${booking.code}_${Date.now()}`;
      
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "MOMO",
          amountVnd: booking.totalAmountVnd,
          status: "PENDING",
          transactionId: orderId,
          raw: {
            demoMode: true,
            createdForSimulation: true,
            orderId,
            createdAt: new Date().toISOString(),
          },
        },
      });
    }

    const simulatedTransactionId = `MOMO_SIM_${Date.now()}`;
    
    if (action === "success") {
      // Giả lập thanh toán thành công
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
            transactionId: simulatedTransactionId,
            raw: {
              ...(payment.raw as any),
              simulatedPayment: {
                action: "success",
                transactionId: simulatedTransactionId,
                processedAt: new Date().toISOString(),
                simulationMode: true,
              },
            },
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "PAID" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Payment simulated successfully",
        transactionId: simulatedTransactionId,
        redirectUrl: `/booking/confirm/${bookingCode}?payment=success&simulated=true`,
      });
    } else if (action === "fail") {
      // Giả lập thanh toán thất bại
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          raw: {
            ...(payment.raw as any),
            simulatedPayment: {
              action: "fail",
              reason: "Insufficient balance (simulated)",
              processedAt: new Date().toISOString(),
              simulationMode: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment failure simulated",
        redirectUrl: `/booking/confirm/${bookingCode}?payment=failed&reason=Insufficient+balance&simulated=true`,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'success' or 'fail'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("MoMo simulation error:", error);
    return NextResponse.json(
      { error: "Simulation failed" },
      { status: 500 }
    );
  }
}
