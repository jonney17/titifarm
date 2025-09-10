import { MomoService } from '../app/lib/momo';

console.log('🧪 Demo MoMo Payment Flow - TitiFarm');
console.log('=====================================\n');

async function demoPaymentFlow() {
  console.log('📋 Current Configuration:');
  console.log('• Environment:', process.env.NODE_ENV || 'development');
  console.log('• MoMo Endpoint:', process.env.MOMO_ENDPOINT || 'Test environment');
  console.log('• Partner Code:', process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529 (Test)');
  
  if (process.env.MOMO_PARTNER_CODE === 'MOMOBKUN20180529') {
    console.log('⚠️  WARNING: Using MoMo TEST environment');
    console.log('   → Payments are simulated, no real money involved');
    console.log('   → To receive real money, setup MoMo Business account\n');
  } else {
    console.log('✅ Using MoMo PRODUCTION environment');
    console.log('   → Real payments will be processed');
    console.log('   → Money will go to your linked bank account\n');
  }

  try {
    console.log('🚀 Creating demo payment request...\n');
    
    const demoBooking = {
      code: 'DEMO_BOOKING_' + Date.now(),
      tourName: 'TitiFarm Agricultural Tour',
      customerName: 'Nguyen Demo User',
      amount: 500000, // 500,000 VND
    };

    const paymentRequest = {
      amount: demoBooking.amount,
      orderInfo: `Thanh toán tour ${demoBooking.tourName} - ${demoBooking.code}`,
      orderId: `MOMO_${demoBooking.code}_${Date.now()}`,
      requestId: `REQ_${Date.now()}`,
      extraData: JSON.stringify({
        bookingCode: demoBooking.code,
        customerName: demoBooking.customerName,
      }),
      userInfo: {
        name: demoBooking.customerName,
        phoneNumber: '0987654321',
        email: 'demo@titifarm.com',
      },
    };

    console.log('📦 Payment Request Details:');
    console.log('• Tour:', demoBooking.tourName);
    console.log('• Customer:', demoBooking.customerName);
    console.log('• Amount:', new Intl.NumberFormat('vi-VN').format(demoBooking.amount) + '₫');
    console.log('• Order ID:', paymentRequest.orderId);
    console.log('• Request ID:', paymentRequest.requestId);
    console.log();

    const response = await MomoService.createPayment(paymentRequest);

    console.log('✅ MoMo API Response:');
    console.log('• Result Code:', response.resultCode);
    console.log('• Message:', response.message);
    console.log('• Order ID:', response.orderId);
    console.log('• Pay URL:', response.payUrl ? '✅ Generated' : '❌ Not available');
    console.log('• QR Code URL:', response.qrCodeUrl ? '✅ Generated' : '❌ Not available');
    console.log('• Deeplink:', response.deeplink ? '✅ Available' : '❌ Not available');
    console.log();

    if (response.qrCodeUrl) {
      console.log('📱 QR Code Payment Instructions:');
      console.log('1. Open MoMo app on your phone');
      console.log('2. Tap "Scan QR" or "Quét mã QR"');
      console.log('3. Scan this QR code:');
      console.log('   ' + response.qrCodeUrl);
      console.log('4. Confirm payment in MoMo app');
      console.log('5. Check website for payment confirmation');
      console.log();
    }

    if (response.payUrl) {
      console.log('🌐 Web Payment:');
      console.log('• Payment URL:', response.payUrl);
      console.log('• Open this URL in browser to see MoMo payment page');
      console.log();
    }

    console.log('🔄 What happens next:');
    console.log('1. Customer scans QR or opens payment URL');
    console.log('2. Customer confirms payment in MoMo app');
    console.log('3. MoMo sends callback to our API:');
    console.log('   → Callback URL: /api/payment/momo/callback');
    console.log('   → IPN URL: /api/payment/momo/ipn');
    console.log('4. Our system updates booking status');
    console.log('5. Customer sees confirmation page');
    
    if (process.env.MOMO_PARTNER_CODE === 'MOMOBKUN20180529') {
      console.log('\n💰 Money Flow (TEST MODE):');
      console.log('• No real money is transferred');
      console.log('• Payment is simulated');
      console.log('• Good for testing user experience');
    } else {
      console.log('\n💰 Money Flow (PRODUCTION):');
      console.log('• Real money transferred from customer MoMo wallet');
      console.log('• MoMo takes fee: ~1.5-2.5% of transaction');
      console.log('• Remaining amount goes to your business bank account');
      console.log('• Settlement time: T+1 (next business day)');
    }

    console.log('\n📊 Business Impact:');
    console.log('• Tour Price:', new Intl.NumberFormat('vi-VN').format(demoBooking.amount) + '₫');
    
    if (process.env.MOMO_PARTNER_CODE !== 'MOMOBKUN20180529') {
      const feeRate = 0.02; // 2% estimated
      const momoFee = Math.round(demoBooking.amount * feeRate);
      const netAmount = demoBooking.amount - momoFee;
      
      console.log('• MoMo Fee (~2%):', new Intl.NumberFormat('vi-VN').format(momoFee) + '₫');
      console.log('• Net Revenue:', new Intl.NumberFormat('vi-VN').format(netAmount) + '₫');
    } else {
      console.log('• MoMo Fee: 0₫ (Test mode)');
      console.log('• Net Revenue: 0₫ (Test mode)');
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('• Check internet connection');
    console.log('• Verify MoMo credentials');
    console.log('• Check environment variables');
    console.log('• Review MoMo API documentation');
  }
}

// Run demo
demoPaymentFlow();
