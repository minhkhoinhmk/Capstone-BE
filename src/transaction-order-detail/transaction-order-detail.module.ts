import { Module } from '@nestjs/common';
import { TransactionOrderDetailService } from './transaction-order-detail.service';
import { TransactionOrderDetailController } from './transaction-order-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionOrderDetail } from './entity/transaction-order-detail.entity';
import { OrderDetailModule } from 'src/order-detail/order-detail.module';
import { TransactionOrderDetailRepository } from './transaction-order-detail.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrderDetail]),
    OrderDetailModule,
    AuthModule,
  ],
  providers: [TransactionOrderDetailService, TransactionOrderDetailRepository],
  controllers: [TransactionOrderDetailController],
  exports: [TransactionOrderDetailRepository],
})
export class TransactionOrderDetailModule {}
