# 🚀 Production Deployment Guide - MoMo Payment

## Chuẩn bị trước khi deploy

### 1. **Đăng ký MoMo Business Account**
- Truy cập: https://business.momo.vn/
- Đăng ký tài khoản doanh nghiệp
- Hoàn tất xác minh KYC
- Lấy thông tin production credentials:
  - `PARTNER_CODE`
  - `ACCESS_KEY` 
  - `SECRET_KEY`

### 2. **Setup Database Production**
```bash
# Nếu sử dụng Neon (khuyến nghị)
# 1. Tạo database tại https://neon.tech
# 2. Copy connection string
# 3. Run migrations
DATABASE_URL="postgresql://..." npx prisma db push
```

### 3. **Cài đặt Vercel CLI**
```bash
npm install -g vercel
vercel login
```

## 🏗️ Deployment Process

### Option A: Automatic Deployment
```bash
# Chạy script tự động
./scripts/deploy-production.sh
```

### Option B: Manual Deployment

#### 1. Setup Environment Variables
```bash
# Vào Vercel Dashboard > Settings > Environment Variables
# Hoặc dùng CLI:

vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production  
vercel env add NEXTAUTH_SECRET production
vercel env add MOMO_PARTNER_CODE production
vercel env add MOMO_ACCESS_KEY production
vercel env add MOMO_SECRET_KEY production
```

#### 2. Deploy
```bash
vercel --prod
```

## 🔧 Production Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-a-secure-secret"

# MoMo Production (từ MoMo Business)
MOMO_PARTNER_CODE="YOUR_PRODUCTION_PARTNER_CODE"
MOMO_ACCESS_KEY="YOUR_PRODUCTION_ACCESS_KEY"
MOMO_SECRET_KEY="YOUR_PRODUCTION_SECRET_KEY"

# Auto URLs (tự động generate)
# MOMO_REDIRECT_URL sẽ tự động là: https://your-domain.vercel.app/api/payment/momo/callback
# MOMO_IPN_URL sẽ tự động là: https://your-domain.vercel.app/api/payment/momo/ipn
```

## ⚙️ Cấu hình MoMo Business Portal

Sau khi deploy, cần cập nhật trong MoMo Business Portal:

### 1. **Callback URLs**
```
Return URL: https://your-domain.vercel.app/api/payment/momo/callback
IPN URL: https://your-domain.vercel.app/api/payment/momo/ipn
```

### 2. **Whitelist Domain**
- Thêm domain của bạn vào whitelist
- Cấu hình CORS nếu cần

### 3. **Webhook Settings**
- Enable IPN notifications
- Set timeout: 30 seconds
- Retry: 3 times

## 🧪 Testing Production

### 1. **Smoke Test**
```bash
# Test API endpoints
curl https://your-domain.vercel.app/api/payment/momo/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"bookingCode":"TEST_BOOKING"}'
```

### 2. **End-to-End Test**
1. Tạo booking thật
2. Thanh toán với MoMo production
3. Verify callback được xử lý
4. Check database updates

### 3. **Monitoring**
```bash
# Xem logs real-time
vercel logs --follow

# Check function performance
vercel analytics
```

## 🔒 Security Checklist

- ✅ **Environment Variables**: Không có credentials trong code
- ✅ **HTTPS**: Tất cả endpoints dùng HTTPS
- ✅ **Signature Verification**: Verify mọi callback từ MoMo
- ✅ **Rate Limiting**: Implement nếu cần
- ✅ **Error Handling**: Không expose internal errors
- ✅ **Logging**: Log đầy đủ nhưng không log sensitive data

## 🚨 Go-Live Checklist

### Trước khi go-live:
- [ ] Test với real MoMo account
- [ ] Verify all callback URLs
- [ ] Check database connections
- [ ] Monitor error rates < 1%
- [ ] Setup alerting/monitoring
- [ ] Backup database
- [ ] Document rollback plan

### Sau khi go-live:
- [ ] Monitor first transactions
- [ ] Check callback success rates
- [ ] Verify customer experience
- [ ] Monitor performance metrics

## 📊 Monitoring & Analytics

### 1. **Vercel Analytics**
- Function execution times
- Error rates
- Memory usage
- Cold starts

### 2. **Custom Monitoring**
```typescript
// Log payment events
console.log('MOMO_PAYMENT_CREATED', {
  orderId,
  amount,
  timestamp: new Date().toISOString()
});
```

### 3. **Database Monitoring**
- Payment success rates
- Average processing time
- Failed payments analysis

## 🔧 Troubleshooting

### Common Issues:

1. **"Function timeout"**
   - Increase timeout trong vercel.json
   - Optimize database queries

2. **"Invalid signature"** 
   - Verify SECRET_KEY
   - Check parameter ordering

3. **"Callback not received"**
   - Check IPN URL accessibility
   - Verify MoMo portal settings

4. **"Database connection failed"**
   - Check DATABASE_URL
   - Verify SSL settings

## 📞 Support

- **MoMo Business Support**: https://business.momo.vn/support
- **Vercel Support**: https://vercel.com/support
- **Technical Documentation**: Check MOMO_PAYMENT_GUIDE.md

## 🔄 Rollback Plan

Nếu có vấn đề:
```bash
# Rollback to previous deployment
vercel rollback

# Disable payment temporarily
# Set MOMO_PARTNER_CODE="" để disable MoMo payments
```
