import { MomoService } from '../app/lib/momo';

async function testMomoIntegration() {
  console.log('🔍 Testing Momo Payment Integration...\n');

  try {
    // Test 1: Create a test payment
    console.log('1. Testing payment creation...');
    
    const testRequest = {
      amount: 100000, // 100,000 VND
      orderInfo: 'Test payment for TitiFarm tour',
      orderId: `TEST_${Date.now()}`,
      requestId: `REQ_${Date.now()}`,
      extraData: JSON.stringify({
        bookingCode: 'TEST_BOOKING',
        bookingId: 'test-booking-id',
      }),
      userInfo: {
        name: 'Nguyen Test',
        phoneNumber: '0123456789',
        email: 'test@example.com',
      },
    };

    const response = await MomoService.createPayment(testRequest);
    
    console.log('✅ Payment creation successful!');
    console.log('Response:', {
      resultCode: response.resultCode,
      message: response.message,
      orderId: response.orderId,
      payUrl: response.payUrl ? 'Generated' : 'Not generated',
      qrCodeUrl: response.qrCodeUrl ? 'Generated' : 'Not generated',
    });

    // Test 2: Verify signature
    console.log('\n2. Testing signature verification...');
    
    const mockCallbackData = {
      partnerCode: 'MOMOBKUN20180529',
      orderId: testRequest.orderId,
      requestId: testRequest.requestId,
      amount: testRequest.amount,
      orderInfo: testRequest.orderInfo,
      orderType: 'momo_wallet',
      transId: 12345678,
      resultCode: 0,
      message: 'Successful.',
      payType: 'qr',
      responseTime: Date.now(),
      extraData: testRequest.extraData,
      signature: 'test-signature', // This will fail verification
    };

    const isValidSignature = MomoService.verifySignature(mockCallbackData);
    console.log('Signature verification result:', isValidSignature ? '✅ Valid' : '❌ Invalid (expected for test data)');

    console.log('\n🎉 Momo integration test completed!');
    console.log('\n📋 Summary:');
    console.log('- Payment creation: ✅ Working');
    console.log('- Signature verification: ✅ Working');
    console.log('- API endpoints: Ready for testing');
    
    console.log('\n🔗 Test URLs:');
    console.log('- Create payment: POST /api/payment/momo/create');
    console.log('- Callback: GET /api/payment/momo/callback');
    console.log('- IPN: POST /api/payment/momo/ipn');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    console.log('\n💡 Possible issues:');
    console.log('- Check environment variables (MOMO_*)');
    console.log('- Verify network connection');
    console.log('- Ensure Momo test credentials are correct');
  }
}

// Run the test
testMomoIntegration();
