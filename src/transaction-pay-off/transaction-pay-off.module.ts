import { Module } from '@nestjs/common';
import { TransactionPayOffService } from './transaction-pay-off.service';
import { TransactionPayOffController } from './transaction-pay-off.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionPayOff } from './entity/transaction-pay-off.entity';
import { TransactionPayOfflRepository } from './transaction-pay-off.repository';
import { TransactionOrderDetailModule } from 'src/transaction-order-detail/transaction-order-detail.module';
import { OrderDetailModule } from 'src/order-detail/order-detail.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { RefundModule } from 'src/refund/refund.module';
import { TransactionPayOffMapper } from './mapper/transaction-pay-off.mapper';
import { DeviceModule } from 'src/device/device.module';
import { NotificationModule } from 'src/notification/notification.module';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionPayOff]),
    TransactionOrderDetailModule,
    OrderDetailModule,
    UserModule,
    AuthModule,
    RefundModule,
    DeviceModule,
    NotificationModule,
    DynamodbModule,
  ],
  providers: [
    TransactionPayOffService,
    TransactionPayOfflRepository,
    TransactionPayOffMapper,
  ],
  controllers: [TransactionPayOffController],
})
export class TransactionPayOffModule {}
