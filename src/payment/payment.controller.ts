import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { createPaymentURLDto } from 'src/payment/order.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('/create')
  createPayment(@Req() req: Request, @Body() dto: createPaymentURLDto): string {
    const ipAddr = req.headers['x-forwarded-for'];

    const url = this.paymentService.createPaymentURL(
      typeof ipAddr === 'string' ? ipAddr : '123',
      dto,
    );

    return url;
  }
}
