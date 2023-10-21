import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entity/payment-method.entity';
import { PaymentMethodRepository } from './payment-method.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  providers: [PaymentMethodRepository],
  exports: [PaymentMethodRepository],
})
export class PaymentMethodModule {}
