import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CreatePaymentURLDto } from './dto/request/create-payment-url.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('/create')
  createPayment(@Req() req: Request, @Body() dto: CreatePaymentURLDto): string {
    const ipAddr = req.headers['x-forwarded-for'];

    const url = this.paymentService.createPaymentURL(
      typeof ipAddr === 'string' ? ipAddr : '123',
      dto,
    );

    return url;
  }
}
