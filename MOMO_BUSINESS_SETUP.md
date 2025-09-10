# 🏪 Hướng dẫn Setup MoMo Business - Nhận Thanh Toán Thật

## 📋 Yêu cầu để đăng ký MoMo Business

### 1. **Giấy tờ cần thiết:**
- **Cá nhân**: CCCD, Giấy phép kinh doanh (nếu có)
- **Doanh nghiệp**: Giấy phép kinh doanh, Giấy chứng nhận đầu tư
- **Tài khoản ngân hàng** chính chủ

### 2. **Thông tin kinh doanh:**
- Tên doanh nghiệp/cá nhân
- Địa chỉ kinh doanh
- Loại hình kinh doanh: **Du lịch/Tour**
- Website: `https://titifarm-pu06a4r98-jonney17s-projects.vercel.app`

## 🚀 Quy trình đăng ký

### **Bước 1: Truy cập MoMo Business**
```
URL: https://business.momo.vn/
```

### **Bước 2: Chọn gói dịch vụ**
- **Merchant Basic**: Miễn phí, phù hợp bắt đầu
- **Merchant Premium**: Có phí, nhiều tính năng hơn

### **Bước 3: Điền thông tin**
```
Tên doanh nghiệp: TitiFarm Tourism
Loại hình: Du lịch - Dịch vụ tour
Website: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app
Mô tả: Cung cấp dịch vụ tour du lịch nông trại
```

### **Bước 4: Upload giấy tờ**
- Chụp rõ ràng tất cả giấy tờ
- Đảm bảo thông tin khớp với form đăng ký

### **Bước 5: Chờ duyệt** (3-7 ngày làm việc)

## 💰 Phí và hoa hồng

### **Phí giao dịch MoMo:**
```
- QR Code: 1.5% - 2.5% mỗi giao dịch
- Số tiền tối thiểu: 1,000 VND
- Số tiền tối đa: 50,000,000 VND/ngày
```

### **Thời gian nhận tiền:**
```
- T+1: Tiền về tài khoản ngân hàng sau 1 ngày làm việc
- T+0: Tức thì (phí cao hơn)
```

## 🔧 Cấu hình sau khi được duyệt

### **1. Lấy thông tin production:**
Sau khi MoMo duyệt, bạn sẽ nhận được:
```
MOMO_PARTNER_CODE="MOMO + số điện thoại"
MOMO_ACCESS_KEY="production_access_key"  
MOMO_SECRET_KEY="production_secret_key"
```

### **2. Cập nhật Vercel Environment Variables:**
```bash
# Truy cập Vercel Dashboard
https://vercel.com/jonney17s-projects/titifarm/settings/environment-variables

# Thay thế các test values bằng production:
MOMO_PARTNER_CODE=<PRODUCTION_VALUE>
MOMO_ACCESS_KEY=<PRODUCTION_VALUE>
MOMO_SECRET_KEY=<PRODUCTION_VALUE>
```

### **3. Cấu hình Callback URLs trong MoMo Portal:**
```
Return URL: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app/api/payment/momo/callback
IPN URL: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app/api/payment/momo/ipn
```

## 🧪 Test Production

### **Test với account thật:**
1. Sử dụng MoMo app thật trên điện thoại
2. Tạo booking test trên website
3. Thanh toán bằng QR code
4. Kiểm tra tiền về tài khoản ngân hàng

## ⚠️ Lưu ý quan trọng

### **Bảo mật:**
- ❌ **KHÔNG** commit production credentials vào Git
- ✅ Chỉ lưu trong Vercel Environment Variables
- ✅ Rotate keys định kỳ

### **Compliance:**
- Tuân thủ quy định PCI DSS
- Không lưu trữ thông tin thẻ/tài khoản khách hàng
- Log transactions nhưng không log sensitive data

### **Monitoring:**
- Theo dõi success rate
- Alert khi có lỗi payment
- Reconciliation hàng ngày

## 💡 Alternative: Sử dụng MoMo Test Environment (Hiện tại)

### **Nếu chưa ready cho production:**
```javascript
// Code hiện tại đang dùng MoMo test environment
// Có thể test flow nhưng KHÔNG nhận tiền thật

// Test credentials (đã có sẵn):
MOMO_PARTNER_CODE="MOMOBKUN20180529"
MOMO_ACCESS_KEY="klm05TvNBzhg7h7j"  
MOMO_SECRET_KEY="at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa"
```

### **Test với MoMo app:**
1. Download MoMo app
2. Đăng ký tài khoản test 
3. Quét QR code từ website
4. Hoàn tất flow (không mất tiền thật)

## 📞 Hỗ trợ

### **MoMo Business Support:**
```
- Hotline: 1900 5454 12
- Email: merchant@momo.vn
- Portal: https://business.momo.vn/support
```

### **Technical Issues:**
```
- Developer docs: https://developers.momo.vn/
- Integration guide: https://developers.momo.vn/v3/
```

## 🎯 Roadmap

### **Phase 1: Test Environment** ✅
- [x] Technical integration
- [x] QR code generation  
- [x] Callback handling
- [x] Error handling

### **Phase 2: Production Setup** 🔄
- [ ] MoMo Business registration
- [ ] Production credentials
- [ ] Real money testing
- [ ] Go-live

### **Phase 3: Optimization** 📈
- [ ] Analytics & reporting
- [ ] Refund functionality  
- [ ] Multiple payment methods
- [ ] Subscription/recurring payments
