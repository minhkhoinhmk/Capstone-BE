import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contest } from './entity/contest.entity';
import { UserModule } from 'src/user/user.module';
import { ContestRepository } from './contest.repository';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { ContestMapper } from './mapper/contest.mapper';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PromotionModule } from 'src/promotion/promotion.module';
import { WinnerModule } from 'src/winner/winner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contest]),
    UserModule,
    S3Module,
    AuthModule,
    ConfigModule,
    PromotionModule,
    WinnerModule,
  ],
  providers: [ContestService, ContestRepository, ContestMapper, ConfigService],
  controllers: [ContestController],
  exports: [ContestRepository],
})
export class ContestModule {}
