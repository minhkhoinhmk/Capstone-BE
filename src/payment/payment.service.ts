import { Injectable } from '@nestjs/common';
import { createPaymentURLDto } from 'src/payment/order.dto';
import { DateTime } from 'luxon';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentService {
  createPaymentURL(
    ip: string,
    {
      amount,
      language,
      message,
      bankCode,
      orderId,
      returnUrl,
    }: createPaymentURLDto,
  ): string {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    const nowFormat = now.toFormat('yyyyLLddHHmmss');
    const orderIds = orderId ?? now.toFormat('ddHHmmss');

    const url = new URL('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');

    url.searchParams.set('vnp_Version', '2.1.0');
    url.searchParams.set('vnp_Command', 'pay');
    url.searchParams.set('vnp_TmnCode', 'U6H1R51F');
    url.searchParams.set('vnp_Locale', language);
    url.searchParams.set('vnp_CurrCode', 'VND');
    url.searchParams.set('vnp_TxnRef', orderIds);
    url.searchParams.set('vnp_OrderInfo', message);
    url.searchParams.set('vnp_OrderType', 'other');
    url.searchParams.set('vnp_Amount', (amount * 100).toString());
    url.searchParams.set(
      'vnp_ReturnUrl',
      returnUrl ?? 'https://www.npmjs.com/package/luxon',
    );
    url.searchParams.set('vnp_IpAddr', ip);
    url.searchParams.set('vnp_CreateDate', nowFormat);

    if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
      url.searchParams.set('vnp_BankCode', 'ncb');
    }

    url.searchParams.sort();

    const hmac = createHmac('SHA512', 'PVZXVNWJKIREZFWSDZGKGPQIOANPSNDU');
    const signed = hmac
      .update(Buffer.from(url.searchParams.toString(), 'utf-8'))
      .digest('hex');

    url.searchParams.set('vnp_SecureHash', signed);

    return url.href;
  }
}
