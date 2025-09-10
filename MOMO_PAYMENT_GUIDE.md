# Hướng dẫn Thanh toán MoMo QR

## Tổng quan

Hệ thống đã được tích hợp thanh toán MoMo QR để khách hàng có thể thanh toán tour du lịch một cách tiện lợi thông qua ứng dụng MoMo hoặc quét mã QR.

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env.local`:

```env
# Momo Payment Gateway Configuration (Test)
MOMO_PARTNER_CODE="MOMOBKUN20180529"
MOMO_ACCESS_KEY="klm05TvNBzhg7h7j"
MOMO_SECRET_KEY="at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa"
MOMO_ENDPOINT="https://test-payment.momo.vn/v2/gateway/api/create"

# Payment URLs (cập nhật domain của bạn)
MOMO_REDIRECT_URL="http://localhost:3000/api/payment/momo/callback"
MOMO_IPN_URL="http://localhost:3000/api/payment/momo/ipn"
```

**Lưu ý**: Đây là thông tin test. Khi triển khai production, cần thay thế bằng thông tin thật từ MoMo.

## Cách thức hoạt động

### 1. Luồng thanh toán

1. **Khách hàng đặt tour** → Tạo booking với status "PENDING"
2. **Chọn thanh toán** → Redirect tới `/payment/gateway/{bookingCode}`
3. **Chọn MoMo** → Gọi API `/api/payment/momo/create`
4. **Hiển thị QR Code** → Khách hàng quét mã hoặc mở MoMo app
5. **Thanh toán** → MoMo xử lý và gửi callback
6. **Xác nhận** → Cập nhật booking status thành "PAID"

### 2. API Endpoints

#### POST `/api/payment/momo/create`
Tạo payment request với MoMo.

**Request:**
```json
{
  "bookingCode": "BOOKING_CODE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payUrl": "https://payment.momo.vn/...",
    "qrCodeUrl": "https://api.qrserver.com/...",
    "deeplink": "momo://...",
    "orderId": "MOMO_BOOKING_CODE_timestamp",
    "amount": 500000
  }
}
```

#### GET `/api/payment/momo/callback`
Xử lý callback từ MoMo sau khi thanh toán.

**Parameters:**
- `partnerCode`, `orderId`, `requestId`, `amount`, `orderInfo`
- `resultCode`, `message`, `signature`, `extraData`, etc.

#### POST `/api/payment/momo/ipn`
Xử lý IPN (Instant Payment Notification) từ MoMo.

## Components

### MomoPaymentForm
Component React để hiển thị form thanh toán MoMo với:
- Button tạo thanh toán
- QR Code hiển thị
- Deeplink mở MoMo app
- Thông tin đơn hàng
- Hướng dẫn sử dụng

## Tính năng

✅ **Đã implement:**
- Tạo payment request với MoMo API
- Hiển thị QR Code cho thanh toán
- Xử lý callback và IPN
- Cập nhật trạng thái booking tự động
- UI/UX thân thiện với người dùng
- Xác thực chữ ký bảo mật
- Error handling và logging

⏳ **Sẽ cập nhật:**
- Webhook retry mechanism
- Payment status tracking
- Refund functionality
- Analytics và reporting

## Testing

### 1. Chạy test integration:
```bash
npm run test:momo
# hoặc
npx tsx scripts/test-momo.ts
```

### 2. Test thủ công:
1. Tạo một booking
2. Truy cập `/payment/gateway/{bookingCode}`
3. Click "Thanh toán với MoMo"
4. Kiểm tra QR Code được hiển thị
5. Test callback URLs

## Lưu ý bảo mật

1. **Environment Variables**: Không commit thông tin sensitive vào git
2. **Signature Verification**: Luôn verify signature từ MoMo callback
3. **HTTPS**: Sử dụng HTTPS cho production
4. **IPN URL**: Đảm bảo IPN URL accessible từ MoMo servers

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid signature"**
   - Kiểm tra SECRET_KEY
   - Verify thứ tự parameters trong signature

2. **"Booking not found"**
   - Kiểm tra bookingCode trong extraData
   - Verify database connection

3. **"QR Code not showing"**
   - Kiểm tra response từ MoMo API
   - Verify API credentials

### Debug logs:
Check console logs cho detailed error messages và MoMo API responses.

## Production Deployment

1. **Đăng ký MoMo Business**: Lấy thông tin production
2. **Update ENV**: Thay credentials test bằng production
3. **Update URLs**: Đổi callback URLs thành domain thật
4. **Test**: Kiểm tra kỹ trước khi go-live
5. **Monitor**: Theo dõi transactions và error logs

## Liên hệ hỗ trợ

- **MoMo Developer**: https://developers.momo.vn/
- **Technical Support**: Qua portal của MoMo Business
