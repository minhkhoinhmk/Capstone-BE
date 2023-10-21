import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatusRepository } from './order-status.repository';
import { OrderStatus } from './entity/order-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderStatus])],
  providers: [OrderStatusRepository],
  exports: [OrderStatusRepository],
})
export class OrderStatusModule {}
