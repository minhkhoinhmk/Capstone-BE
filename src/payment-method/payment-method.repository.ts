import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entity/payment-method.entity';
import { NamePaymentMethod } from './enum/name-payment-method.enum';

@Injectable()
export class PaymentMethodRepository {
  private logger = new Logger('PaymentMethodRepository', { timestamp: true });

  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async getPaymentMethodByName(
    name: NamePaymentMethod,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { name: name },
    });
    return paymentMethod;
  }
}
