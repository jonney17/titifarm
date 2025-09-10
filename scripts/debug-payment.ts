import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPaymentIssue() {
  console.log('🔍 Debugging Payment Issue...\n');

  try {
    // Lấy tất cả bookings gần đây
    const recentBookings = await prisma.booking.findMany({
      include: {
        payments: true,
        tour: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    console.log('📋 Recent Bookings:');
    console.log('==================');

    for (const booking of recentBookings) {
      console.log(`\n📦 Booking: ${booking.code}`);
      console.log(`   Tour: ${booking.tour.title}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Amount: ${new Intl.NumberFormat('vi-VN').format(booking.totalAmountVnd)}₫`);
      console.log(`   Created: ${booking.createdAt.toLocaleString('vi-VN')}`);
      
      if (booking.payments.length > 0) {
        console.log(`   💳 Payments (${booking.payments.length}):`);
        booking.payments.forEach((payment, index) => {
          console.log(`     ${index + 1}. Provider: ${payment.provider}`);
          console.log(`        Status: ${payment.status}`);
          console.log(`        Amount: ${new Intl.NumberFormat('vi-VN').format(payment.amountVnd)}₫`);
          console.log(`        Transaction ID: ${payment.transactionId || 'N/A'}`);
          console.log(`        Created: ${payment.createdAt.toLocaleString('vi-VN')}`);
          
          if (payment.raw) {
            const raw = payment.raw as any;
            if (raw.demoMode) {
              console.log(`        🎮 Demo Mode: ${raw.demoMode}`);
            }
            if (raw.createdForSimulation) {
              console.log(`        🔧 Auto-created for simulation`);
            }
          }
        });
      } else {
        console.log(`   💳 Payments: None`);
      }
    }

    // Stats
    const totalBookings = await prisma.booking.count();
    const paidBookings = await prisma.booking.count({
      where: { status: 'PAID' }
    });
    const pendingPayments = await prisma.payment.count({
      where: { status: 'PENDING' }
    });
    const successfulPayments = await prisma.payment.count({
      where: { status: 'SUCCEEDED' }
    });

    console.log('\n📊 Statistics:');
    console.log('===============');
    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Paid Bookings: ${paidBookings}`);
    console.log(`Pending Payments: ${pendingPayments}`);
    console.log(`Successful Payments: ${successfulPayments}`);

    // Test scenarios
    console.log('\n🧪 Test Scenarios:');
    console.log('==================');
    console.log('1. Tạo booking mới và test simulation');
    console.log('2. Check existing booking có payment records');
    console.log('3. Verify simulation tự động tạo payment nếu cần');

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run debug
debugPaymentIssue();
