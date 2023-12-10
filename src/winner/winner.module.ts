import { Module } from '@nestjs/common';
import { WinnerService } from './winner.service';
import { WinnerController } from './winner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Winner } from './entity/winner.entity';
import { CustomerDrawingModule } from 'src/customer-drawing/customer-drawing.module';
import { ContestModule } from 'src/contest/contest.module';
import { WinnerRepository } from './winner.repository';
import { WinnerMapper } from './mapper/winner.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Winner]),
    CustomerDrawingModule,
    ContestModule,
  ],
  providers: [WinnerService, WinnerRepository, WinnerMapper],
  controllers: [WinnerController],
})
export class WinnerModule {}
