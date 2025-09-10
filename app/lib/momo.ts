import crypto from 'crypto';

// Momo API Configuration
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const MOMO_CONFIG = {
  PARTNER_CODE: process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529',
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j',
  SECRET_KEY: process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
  ENDPOINT: process.env.MOMO_ENDPOINT || (isProduction 
    ? 'https://payment.momo.vn/v2/gateway/api/create' 
    : 'https://test-payment.momo.vn/v2/gateway/api/create'),
  REDIRECT_URL: process.env.MOMO_REDIRECT_URL || `${baseUrl}/api/payment/momo/callback`,
  IPN_URL: process.env.MOMO_IPN_URL || `${baseUrl}/api/payment/momo/ipn`,
  QUERY_ENDPOINT: isProduction 
    ? 'https://payment.momo.vn/v2/gateway/api/query'
    : 'https://test-payment.momo.vn/v2/gateway/api/query',
};

export interface MomoPaymentRequest {
  amount: number;
  orderInfo: string;
  orderId: string;
  requestId: string;
  extraData?: string;
  userInfo?: {
    name: string;
    phoneNumber: string;
    email: string;
  };
}

export interface MomoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  qrCodeUrl: string;
  deeplink: string;
  deeplinkMiniApp: string;
}

export interface MomoCallbackData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

export class MomoService {
  /**
   * Tạo chữ ký cho request
   */
  private static createSignature(data: Record<string, any>): string {
    const rawSignature = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', MOMO_CONFIG.SECRET_KEY)
      .update(rawSignature)
      .digest('hex');
  }

  /**
   * Xác thực chữ ký từ callback
   */
  public static verifySignature(data: MomoCallbackData): boolean {
    const { signature, ...dataToVerify } = data;
    const expectedSignature = this.createSignature(dataToVerify);
    return signature === expectedSignature;
  }

  /**
   * Tạo payment request cho Momo
   */
  public static async createPayment(request: MomoPaymentRequest): Promise<MomoPaymentResponse> {
    const requestData = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      partnerName: 'TitiFarm Tour',
      storeId: 'TitiFarmStore',
      requestId: request.requestId,
      amount: request.amount,
      orderId: request.orderId,
      orderInfo: request.orderInfo,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      ipnUrl: MOMO_CONFIG.IPN_URL,
      lang: 'vi',
      requestType: 'payWithMethod',
      autoCapture: true,
      extraData: request.extraData || '',
    };

    // Tạo chữ ký
    const signature = this.createSignature({
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      amount: requestData.amount,
      extraData: requestData.extraData,
      ipnUrl: requestData.ipnUrl,
      orderId: requestData.orderId,
      orderInfo: requestData.orderInfo,
      partnerCode: requestData.partnerCode,
      redirectUrl: requestData.redirectUrl,
      requestId: requestData.requestId,
      requestType: requestData.requestType,
    });

    const payload = {
      ...requestData,
      signature,
      accessKey: MOMO_CONFIG.ACCESS_KEY,
    };

    try {
      const response = await fetch(MOMO_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: MomoPaymentResponse = await response.json();
      
      if (result.resultCode !== 0) {
        throw new Error(`Momo API Error: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('Momo payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  public static async queryPaymentStatus(orderId: string, requestId: string) {
    const requestData = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      requestId,
      orderId,
      lang: 'vi',
    };

    const signature = this.createSignature({
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      orderId: requestData.orderId,
      partnerCode: requestData.partnerCode,
      requestId: requestData.requestId,
    });

    const payload = {
      ...requestData,
      signature,
      accessKey: MOMO_CONFIG.ACCESS_KEY,
    };

    try {
      const response = await fetch(MOMO_CONFIG.QUERY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (error) {
      console.error('Momo payment status query failed:', error);
      throw error;
    }
  }
}
