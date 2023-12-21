import { Module, forwardRef } from '@nestjs/common';
import { WinnerService } from './winner.service';
import { WinnerController } from './winner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Winner } from './entity/winner.entity';
import { CustomerDrawingModule } from 'src/customer-drawing/customer-drawing.module';
import { ContestModule } from 'src/contest/contest.module';
import { WinnerRepository } from './winner.repository';
import { WinnerMapper } from './mapper/winner.mapper';
import { PromotionModule } from 'src/promotion/promotion.module';
import { VoteModule } from 'src/vote/vote.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { DeviceModule } from 'src/device/device.module';
import { NotificationModule } from 'src/notification/notification.module';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Winner]),
    AuthModule,
    CustomerDrawingModule,
    forwardRef(() => ContestModule),
    PromotionModule,
    VoteModule,
    UserModule,
    DeviceModule,
    NotificationModule,
    DynamodbModule,
  ],
  providers: [WinnerService, WinnerRepository, WinnerMapper],
  controllers: [WinnerController],
  exports: [WinnerRepository],
})
export class WinnerModule {}
