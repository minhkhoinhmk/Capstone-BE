import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ConfigModule } from '@nestjs/config';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
  imports: [DynamodbModule],
})
export class NotificationModule {}
