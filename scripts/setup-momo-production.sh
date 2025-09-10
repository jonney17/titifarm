#!/bin/bash

echo "🏪 MoMo Business Production Setup Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Hướng dẫn setup MoMo Business để nhận tiền thật${NC}"
echo

# Check current mode
echo -e "${YELLOW}📋 Kiểm tra cấu hình hiện tại...${NC}"
if [ -f ".env.local" ]; then
    echo "✅ File .env.local tồn tại"
    if grep -q "MOMOBKUN20180529" .env.local; then
        echo -e "${YELLOW}⚠️  Hiện đang dùng MoMo TEST environment${NC}"
        echo "   → Chỉ test được, không nhận tiền thật"
    else
        echo -e "${GREEN}✅ Đang dùng production credentials${NC}"
    fi
else
    echo -e "${RED}❌ Chưa có file .env.local${NC}"
fi

echo
echo -e "${BLUE}🔍 Trạng thái hiện tại:${NC}"
echo "   • Technical integration: ✅ Hoàn thành"
echo "   • Production deployment: ✅ Live trên Vercel"
echo "   • MoMo Business account: ❓ Cần đăng ký"
echo "   • Tài khoản nhận tiền: ❓ Cần setup"

echo
echo -e "${YELLOW}📝 BƯỚC 1: Đăng ký MoMo Business${NC}"
echo "1. Truy cập: https://business.momo.vn/"
echo "2. Chọn 'Đăng ký Merchant'"
echo "3. Điền thông tin:"
echo "   - Tên: TitiFarm Tourism"
echo "   - Loại hình: Du lịch - Dịch vụ tour"
echo "   - Website: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app"
echo "4. Upload giấy tờ: CCCD + Giấy phép kinh doanh"
echo "5. Chờ duyệt: 3-7 ngày làm việc"

echo
echo -e "${YELLOW}💰 BƯỚC 2: Thiết lập tài khoản nhận tiền${NC}"
echo "1. Liên kết tài khoản ngân hàng"
echo "2. Cấu hình phí giao dịch: ~1.5-2.5%"
echo "3. Chọn chu kỳ thanh toán: T+1 (sau 1 ngày)"

echo
echo -e "${YELLOW}🔧 BƯỚC 3: Cấu hình Production (Sau khi được duyệt)${NC}"
read -p "Bạn đã có production credentials chưa? (y/N): " has_credentials

if [ "$has_credentials" = "y" ] || [ "$has_credentials" = "Y" ]; then
    echo
    echo -e "${GREEN}✅ Cấu hình Production Credentials${NC}"
    
    read -p "MOMO_PARTNER_CODE: " partner_code
    read -p "MOMO_ACCESS_KEY: " access_key
    read -s -p "MOMO_SECRET_KEY: " secret_key
    echo
    
    # Set Vercel environment variables
    echo -e "${BLUE}🚀 Cập nhật Vercel Environment Variables...${NC}"
    
    echo "$partner_code" | npx vercel env add MOMO_PARTNER_CODE production
    echo "$access_key" | npx vercel env add MOMO_ACCESS_KEY production  
    echo "$secret_key" | npx vercel env add MOMO_SECRET_KEY production
    
    # Update local env for testing
    echo -e "${BLUE}📝 Cập nhật .env.local...${NC}"
    cat > .env.local << EOF
# MoMo Production Configuration
MOMO_PARTNER_CODE="$partner_code"
MOMO_ACCESS_KEY="$access_key"
MOMO_SECRET_KEY="$secret_key"
MOMO_ENDPOINT="https://payment.momo.vn/v2/gateway/api/create"

# Your existing environment variables
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
EOF

    echo -e "${GREEN}✅ Production credentials đã được cấu hình!${NC}"
    
    echo
    echo -e "${YELLOW}📋 Bước tiếp theo:${NC}"
    echo "1. Cập nhật MoMo Business Portal với callback URLs:"
    echo "   Return URL: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app/api/payment/momo/callback"
    echo "   IPN URL: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app/api/payment/momo/ipn"
    echo
    echo "2. Test với tài khoản MoMo thật:"
    echo "   - Tạo booking trên website"
    echo "   - Thanh toán bằng MoMo app"
    echo "   - Kiểm tra tiền về tài khoản ngân hàng"
    
else
    echo
    echo -e "${BLUE}📋 Checklist để có production credentials:${NC}"
    echo "□ Đăng ký MoMo Business: https://business.momo.vn/"
    echo "□ Upload đầy đủ giấy tờ"
    echo "□ Chờ MoMo duyệt (3-7 ngày)"
    echo "□ Nhận email với production credentials"
    echo "□ Chạy lại script này với credentials mới"
    
    echo
    echo -e "${YELLOW}🧪 Trong thời gian chờ, bạn có thể:${NC}"
    echo "• Test payment flow với MoMo sandbox (hiện tại)"
    echo "• Hoàn thiện UI/UX của website"
    echo "• Setup monitoring và analytics"
fi

echo
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "• MoMo Business Registration: https://business.momo.vn/"
echo "• Developer Documentation: https://developers.momo.vn/"  
echo "• Current Website: https://titifarm-pu06a4r98-jonney17s-projects.vercel.app"
echo "• Vercel Dashboard: https://vercel.com/jonney17s-projects/titifarm"

echo
echo -e "${GREEN}✨ Setup script completed!${NC}"
