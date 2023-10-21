import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetailRepository } from './order-detail.repository';
import { OrderDetail } from './entity/order-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])],
  providers: [OrderDetailRepository],
  // controllers: [OrderController],
  exports: [OrderDetailRepository],
})
export class OrderDetailModule {}
