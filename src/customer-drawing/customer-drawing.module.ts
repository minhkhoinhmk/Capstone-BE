import { Module } from '@nestjs/common';
import { CustomerDrawingService } from './customer-drawing.service';
import { CustomerDrawingController } from './customer-drawing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerDrawing } from './entity/customer-drawing.entity';
import { CustomerDrawingRepository } from './customer-drawing.repository';
import { UserModule } from 'src/user/user.module';
import { ContestModule } from 'src/contest/contest.module';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { CustomerDrawingMapper } from './mapper/customer-drawing.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerDrawing]),
    UserModule,
    ContestModule,
    S3Module,
    AuthModule,
  ],
  providers: [
    CustomerDrawingService,
    CustomerDrawingRepository,
    CustomerDrawingMapper,
  ],
  controllers: [CustomerDrawingController],
})
export class CustomerDrawingModule {}
